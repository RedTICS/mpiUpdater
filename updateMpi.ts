import {
    PacienteMpi
} from './pacienteMpi';
import {
    PacienteAndes
} from './pacienteAndes';
import {
    matching
} from '@andes/match/matching';
import * as config from './config';
import * as mongodb from 'mongodb';

// export class UpdateMpi {



    /*Verfica que el paciente que si desea insertar en MPI no exista previamente*/
export function existeEnMpi(pacienteBuscado, coleccionPaciente) {
        let url = config.urlMongoMpi;
        let pacientesEnMpi: any = [];
        let match = new matching();
        let tipoDeMatching = 'Levenshtein';
        let porcentajeMatcheo;
        let condicion = {
            'claveBlocking.0': pacienteBuscado.claveBlocking[0]
        };
        let weights = config.pesos;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function (err, db) {
                if (err) {
                    console.log('Error de conexión con ', err);
                    reject(err);
                } else {
                    /*Busco todos los pacientes en MPI que caen en ese bloque */
                    pacientesEnMpi = db.collection(coleccionPaciente).find(condicion).stream();
                    pacientesEnMpi.on('end', function () {
                        resolve(['new', pacienteBuscado]);
                        db.close();
                    });
                    pacientesEnMpi.on('data', function (data) {
                        if (data != null) {
                            let pacienteDeMpi = data;
                            porcentajeMatcheo = match.matchPersonas(pacienteBuscado, pacienteDeMpi, weights, tipoDeMatching);
                            if (porcentajeMatcheo < 1) {
                                // Inserta como paciente nuevo ya que no matchea al 100%
                                resolve(['new', pacienteBuscado]);
                            } else {
                                /*Encontre el paciente al 100% */
                                /*Para subir la última actualización se debe verificar los timeStamp existentes en caso que en mpi esté más actualizado
                                se asigna notMerge para controlar que no se haga nada y el registro local sea eliminado de Andes por tener información vieja*/
                                let mergeFlag = 'merge'; /*Default value*/

                                if (pacienteDeMpi.updatedAt) {
                                    if (pacienteDeMpi.updatedAt > pacienteBuscado.updatedAt) {
                                        mergeFlag = 'notMerge';
                                    }
                                } else {
                                    if (pacienteDeMpi.createdAt) {
                                        if (pacienteDeMpi.createdAt > pacienteBuscado.createdAt) {
                                            mergeFlag = 'notMerge';
                                        }
                                    }
                                }
                                resolve([mergeFlag, pacienteDeMpi]);
                            }
                            db.close();
                        }
                    });
                }
            });
        });
    }

  export function  updatingMpi() {
        /*Definicion de variables y operaciones*/
        let mpiOperations = new PacienteMpi();
        let andesOperations = new PacienteAndes();
        let coleccion = config.collection;
        let pacientesInsertados: any = [];
        return new Promise((resolve, reject) => {

            try {
                let url = config.urlMongoAndes;
                /*La condición de búsqueda es que sea un paciente validado por fuente auténtica*/
                let condicion = {
                    'estado': 'validado',
                };
                mongodb.MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Error al conectarse a Base de Datos: ', err);
                        reject(err);
                    }
                    let cursorPacientes = db.collection(coleccion).find(condicion).stream();
                    /*Finaliza el recorrido del cursor con los datos de pacientes validados */
                    cursorPacientes.on('end', function () {
                        console.log('El proceso de actualización ha finalizado, total de pacientes insertados en MPI: ', pacientesInsertados.length);
                        resolve(pacientesInsertados);
                    });
                    cursorPacientes.on('data', function (data) {
                        if (data != null) {
                            /*Hacemos una pausa para que de tiempo a la inserción y luego al borrado del paciente*/
                            cursorPacientes.pause();
                            existeEnMpi(data, coleccion)
                                .then((resultado => {
                                    /*Si NO hubo matching al 100% lo tengo que insertar en MPI */
                                    if (resultado[0] !== 'merge') {
                                        if (resultado[0] === 'new') {
                                            pacientesInsertados.push(resultado[1]);
                                            mpiOperations.cargarUnPacienteMpi(resultado[1])
                                            .then((rta) => {
                                                console.log('Paciente Guardado es:', resultado[1]);
                                            });
                                        }
                                    } else {
                                        /*Se fusionan los pacientes, pacFusionar es un paciente de ANDES y tengo q agregar
                                        los campos de este paciente al paciente de mpi*/
                                        let pacienteAndes = data;
                                        let pacienteMpi = resultado[1];
                                        pacienteMpi.direccion = pacienteAndes.direccion;
                                        pacienteMpi.contacto = pacienteAndes.contacto;
                                        pacienteMpi.relaciones = pacienteAndes.relaciones;
                                        pacienteMpi.estadoCivil = pacienteAndes.estadoCivil;
                                        pacienteMpi.identificadores = pacienteAndes.identificadores;
                                        pacienteMpi.entidadesValidadoras = pacienteAndes.entidadesValidadoras;
                                        mpiOperations.actualizaUnPacienteMpi(pacienteMpi)
                                        .then((rta) => {
                                            console.log('El paciente ha sido actualizado: ', pacienteMpi);
                                        });
                                    }
                                }))
                                .then(( resultado => {
                                    /*Borramos el paciente de ANDES*/
                                    andesOperations.borraUnPacienteAndes(data._id)
                                        .then((rta2) => {
                                            console.log('borramos el paciente de Andes:', rta2);
                                        });
                                /*Restablecemos el flujo de trabajo*/
                                cursorPacientes.resume();
                                }));
                        };
                    });
                });
            } catch (err) {
                console.log('Error:', err);
                return err;
            };
        });
    }

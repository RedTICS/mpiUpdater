import * as config from './config';
import * as configPrivate from './config.private';
import * as mongodb from 'mongodb';
import {
    PacienteMpi
} from './pacienteMpi';
import {
    PacienteAndes
} from './pacienteAndes';
import {
    matching
} from '@andes/match';


/*Verfica que el paciente que si desea insertar en MPI no exista previamente*/
export function existeEnMpi(pacienteBuscado: any, coleccionPaciente: any) {
    let url = configPrivate.urlMongoMpi;
    let pacientesEnMpi: any = [];
    let match = new matching();
    let tipoDeMatching = 'Levenshtein';
    let porcentajeMatcheo;
    let condicion = {
        'claveBlocking.0': pacienteBuscado.claveBlocking[0]
    };
    let weights = config.pesos;
    return new Promise((resolve: any, reject: any) => {
        mongodb.MongoClient.connect(url, function (err: any, db: any) {
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
                pacientesEnMpi.on('data', function (data: any) {
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
                            if (pacienteDeMpi.updatedAt && pacienteBuscado.updatedAt) {
                                if (pacienteDeMpi.updatedAt > pacienteBuscado.updatedAt) {
                                    mergeFlag = 'notMerge';
                                }
                            } else {
                                if (pacienteDeMpi.createdAt && pacienteBuscado.createdAt) {
                                    if (pacienteDeMpi.createdAt > pacienteBuscado.createdAt) {
                                        if (pacienteDeMpi.updatedAt) {
                                            if (pacienteDeMpi.createdAt > pacienteBuscado.createdAt) {
                                                mergeFlag = 'notMerge';
                                            }
                                        } else {
                                            mergeFlag = 'notMerge';
                                        }
                                    }
                                }
                            }
                            resolve([mergeFlag, pacienteBuscado]);
                        }
                        db.close();
                    }
                });
            }
        });
    });
}

export function updatingMpi(token: any) {
    /*Definicion de variables y operaciones*/
    let mpiOperations = new PacienteMpi();
    let andesOperations = new PacienteAndes();
    let coleccion = config.collection;
    let pacientesInsertados: any = [];
    let counter = 0;
    return new Promise((resolve: any, reject: any) => {

        try {
            let url = configPrivate.urlMongoAndes;
            /*La condición de búsqueda es que sea un paciente validado por fuente auténtica*/
            let condicion = {
                'estado': 'validado',
            };
            mongodb.MongoClient.connect(url, function (err2: any, db: any) {
                if (err2) {
                    reject(err2);
                }
                let cursorPacientes = db.collection(coleccion).find(condicion).stream();
                /*Finaliza el recorrido del cursor con los datos de pacientes validados */
                cursorPacientes.on('end', function () {
                    console.log('El proceso de actualización ha finalizado, total de pacientes insertados en MPI: ', pacientesInsertados.length);
                    resolve(pacientesInsertados);
                    db.close();
                });
                cursorPacientes.on('data', function (data: any) {
                    if (data != null) {
                        /*Hacemos una pausa para que de tiempo a la inserción y luego al borrado del paciente*/
                        cursorPacientes.pause();
                        existeEnMpi(data, coleccion)
                            .then((resultado: any) => {
                                andesOperations.borraUnPacienteAndes(resultado[1], token)
                                    .then((rta3: any) => {
                                        /*Si NO hubo matching al 100% lo tengo que insertar en MPI */
                                        if (resultado[0] !== 'merge') {
                                            if (resultado[0] === 'new') {
                                                pacientesInsertados.push(resultado[1]);
                                                mpiOperations.cargarUnPacienteMpi(resultado[1], token)
                                                    .then((rta4: any) => {
                                                        // console.log('Paciente Guardado es:', resultado[1]);
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
                                            mpiOperations.actualizaUnPacienteMpi(pacienteMpi, token)
                                                .then((rta5: any) => {
                                                    // console.log('El paciente ha sido actualizado: ', pacienteMpi);
                                                });
                                        }
                                    });
                                console.log('Cantidad de pacientes procesados', counter++);
                                cursorPacientes.resume();
                            });
                    };
                });
            });
        } catch (err) {
            reject(err);
        };
    });
}

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
        let weights = {
            identity: 0.3,
            name: 0.3,
            gender: 0.1,
            birthDate: 0.3
        };
        console.log('antes de llamar a la promise de control de existencia en mpi');
        return new Promise((resolve, reject) => {
            
            mongodb.MongoClient.connect(url, function (err, db) {
                if (err) {
                    console.log('Error de conexión con ', err);
                    reject(err);
                } else {
                    /*Busco todos los pacientes en MPI que caen en ese bloque */
                    console.log('entro a buscar los pacientes de bloque');
                    pacientesEnMpi = db.collection(coleccionPaciente).find(condicion).stream();
                    pacientesEnMpi.on('end', function () {
                        resolve(['insertarNuevo', pacienteBuscado]);
                        db.close();
                    });
                    pacientesEnMpi.on('data', function (data) {
                        if (data != null) {
                            let pacienteDeMpi = data;
                            porcentajeMatcheo = match.matchPersonas(pacienteBuscado, pacienteDeMpi, weights, tipoDeMatching);
                            if (porcentajeMatcheo < 1) {
                                console.log('ingreso por menor que 1 ', porcentajeMatcheo);
                                resolve(['insertarNuevo', pacienteBuscado]);
                            } else {
                                console.log('Entro por igual a 1 por lo que hay que hacer el merge del paciente', porcentajeMatcheo);
                                /*Encontre el paciente al 100% */
                                /*Aca hay q verificar el tema del timestamp de update/insert para subir la última actualización*/
                                resolve(['merge', pacienteDeMpi]);
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
                        console.log('entro al on')
                        if (data != null) {
                            // let listaContactos = [];
                            // if (data.contacto) {
                            //     data.contacto.forEach((cto) => {
                            //         if ((cto.tipo == "Teléfono Fijo") || (cto.tipo == "")) {
                            //             cto.tipo = "fijo";
                            //         }
                            //         if (cto.tipo == "Teléfono Celular") {
                            //             cto.tipo = "celular";
                            //         }
                            //         listaContactos.push(cto);
                            //     })
                            // }
                            //console.log('Lista de contacto: ',listaContactos);
                            // data.contacto = listaContactos;
                            /*Hacemos una pausa para que de tiempo a la inserción y luego al borrado del paciente*/
                            cursorPacientes.pause();
                            existeEnMpi(data, coleccion)
                                .then((resultado => {
                                    /*Si NO hubo matching al 100% lo tengo que insertar en MPI */
                                    if (resultado[0] !== 'merge') {
                                        pacientesInsertados.push(resultado[1]);
                                        mpiOperations.cargarUnPacienteMpi(resultado[1])
                                            .then((rta) => {
                                                console.log('Paciente Guardado es:', resultado[1]);
                                            });
                                    } else {
                                        /*Se fusionan los pacientes, pacFusionar es un paciente de ANDES y tengo q agregar
                                        los campos de este paciente al paciente de mpi*/
                                        let pacFusionar = data;
                                        let idPacMpi = resultado[1]._id;
                                        let urlMpi = config.urlMongoMpi;
                                        mongodb.MongoClient.connect(urlMpi, function (errMpi, dbMpi) {
                                            // Se quitan pacientes
                                            if (errMpi) {
                                                console.log('No se pudo conectar a MPI DB');
                                                reject(errMpi);
                                            }
                                            dbMpi.collection(coleccion).update({
                                                    '_id': idPacMpi
                                                }, {
                                                    $set: {
                                                        'direccion': pacFusionar.direccion,
                                                        'contacto': pacFusionar.contacto,
                                                        'relaciones': pacFusionar.relaciones,
                                                        'estadoCivil': pacFusionar.estadoCivil,
                                                    },
                                                    $addToSet: {
                                                        'identificadores': {
                                                            $each: pacFusionar.identificadores
                                                        },
                                                        'entidadesValidadoras': {
                                                            $each: pacFusionar.entidadesValidadoras
                                                        }
                                                    },
                                                }, {
                                                    upsert: true
                                                },
                                                function (err2) {
                                                    if (err2) {
                                                        console.log('Error update', err2);
                                                        reject(err);
                                                    }
                                                });
                                        })
                                    }
                                    /*Borramos el paciente de ANDES*/
                                    andesOperations.borraUnPacienteAndes(data._id)
                                        .then((rta) => {
                                            console.log('resultado del borrado:', data);
                                        });
                                    /*Restablecemos el flujo de trabajo*/
                                    cursorPacientes.resume();
                                }))
                        };
                    });
                });
            } catch (err) {
                console.log('Entra por este error de catch:', err);
                return err;
            };
        })
    }

//}
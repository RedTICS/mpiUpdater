import {
    EnviarpacienteMpi
} from './enviarpacienteMpi';
import {
    matching
} from 'andes-match/matching';
import * as config from './config';
import * as mongodb from 'mongodb';

export class UpdateMpi {

    updatingMpi() {
        /*Definicion de variables*/
        let post = new EnviarpacienteMpi();
        let coleccion = config.collection;
        let pacientesInsertados = [];

        try {
            let url = config.urlMongoAndes;
            /*La condición de búsqueda es que sea un paciente validado por fuente auténtica*/
            let condicion = {
                'estado': 'validado'
            }
            mongodb.MongoClient.connect(url, function (err, db) {
                if (err) {
                    console.log('Error al conectarse a Base de Datos: ', err);
                }
                let cursorPacientes = db.collection(coleccion).find(condicion).stream();
                cursorPacientes.on('data', function (data) {
                    if (data != null) {
                        /*Hacemos una pausa para que de tiempo a la inserción y luego al borrado del paciente*/
                        cursorPacientes.pause();
                        existeEnMpi(data, coleccion)
                            .then((resultado => {
                                /*Si NO hubo matching al 100% lo tengo que insertar en MPI */
                                if (resultado !== {}) {
                                    pacientesInsertados.push(data);
                                    post.cargarUnPacienteMpi(data)
                                        .then((rta) => {
                                            console.log('Paciente Guardado es:', data);
                                        });
                                };
                                /*Borramos el paciente de ANDES*/
                                db.collection(coleccion).remove({
                                        '_id': data._id
                                    },
                                    function (err, item) {
                                        if (err) {
                                            console.log('Error al querer borrar el paciente ', err);
                                        } else {
                                            console.log('Paciente borrado: ', data);
                                        }
                                    });
                                /*Restablecemos el flujo de trabajo*/
                                cursorPacientes.resume();
                            }))
                    }
                });

                /*Finaliza el recorrido del cursor con los datos de pacientes validados */
                cursorPacientes.on('end', function () {
                    console.log('El proceso de actualización ha finalizado, total de pacientes insertados en MPI: ', pacientesInsertados.length);
                    return true;
                });

            });
        } catch (err) {
            console.log('Entra por este error de catch:', err);
            return false;
        };

        /*Verfica que el paciente que si desea insertar en MPI no exista previamente*/
        function existeEnMpi(pacienteBuscado, coleccionPaciente) {
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
            return new Promise((resolve, reject) => {
                mongodb.MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Error de conexión con ', err);
                        reject(err);
                    } else {
                        /*Busco todos los pacientes en MPI que caen en ese bloque */
                        pacientesEnMpi = db.collection(coleccion).find(condicion).stream();
                        pacientesEnMpi.on('end', function () {
                            db.close();
                        });
                        pacientesEnMpi.on('data', function (data) {
                            if (data != null) {
                                let pacienteDeMpi = data;
                                porcentajeMatcheo = match.matchPersonas(pacienteBuscado, pacienteDeMpi, weights, tipoDeMatching);
                                if (porcentajeMatcheo < 1) {
                                    db.close();
                                    resolve({
                                        pacienteBuscado
                                    });
                                } else {
                                    /*Encontre el paciente al 100% */
                                    resolve({});
                                }
                            }
                        });
                    }
                });
            });

        }
    }
}
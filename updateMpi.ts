import {
    EnviarpacienteMpi
} from './enviarpacienteMpi';
import {
    matching
} from './node_modules/andes-match/matching';
import * as config from './config';
import * as mongodb from 'mongodb';

export class updateMpi {

    updatingMpi() {
        //Definicion de variables
        let post = new EnviarpacienteMpi();
        let coleccion = config.collection;
        let pacientesInsertados = [];

        try {
            var url = config.urlMongoAndes;
            /*La condición de búsqueda es que sea un paciente validado por fuente auténtica*/
            let condicion = {
                "estado": "validado"
            }
            mongodb.MongoClient.connect(url, function (err, db) {
                if (err) {
                    console.log('Error al conectarse a Base de Datos: ', err)
                }
                var cursorPacientes = db.collection(coleccion).find(condicion).stream();
                cursorPacientes.on('data', function (data) {
                    if (data != null) {
                        /*Hacemos una pausa para que de tiempo a la inserción y luego al borrado del paciente*/
                        cursorPacientes.pause();
                        existeEnMpi(data, coleccion)
                            .then((resultado => {
                                /*Borramos el paciente de ANDES*/
                                db.collection(coleccion).remove({
                                        "_id": data._id
                                    },
                                    function (err, item) {
                                        if (err) {
                                            console.log('Error al querer borrar el paciente ', err);
                                        } else {
                                            console.log('Paciente borrado: ', data);
                                        }
                                    });
                                /*Insertamos al paciente en MPI*/
                                if (resultado == null) {
                                    pacientesInsertados.push(data);
                                    post.cargarUnPacienteMpi(data)
                                        .then((rta) => {
                                            console.log('Paciente Guardado es:', data);
                                        })
                                }
                                //Restablecemos el flujo de trabajo
                                cursorPacientes.resume();
                            }))
                    }
                })

                /*Finaliza el recorrido del cursor con los datos de pacientes validados */
                cursorPacientes.on('end', function () {
                    console.log('El proceso de actualización ha finalizado, total de pacientes insertados en MPI: ', pacientesInsertados.length);
                    return true;
                });

            })
        } catch (err) {
            console.log('Entra por este error de catch:', err);
            return false;
        };

        /*Verfica que el paciente que si desea insertar en MPI no exista previamente*/
        function existeEnMpi(pacienteBuscado, coleccionPaciente) {
            let url = config.urlMongoMpi;
            return new Promise((resolve, reject) => {
                var condicion = {
                    "_id": pacienteBuscado._id
                };
                mongodb.MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log("Error de conexión con ", err);
                        reject(err)
                    } else {
                        db.collection(coleccionPaciente).findOne(condicion, function (err, paciente) {
                            if (err) {
                                reject(err)
                            } else {
                                console.log('paciente encontrado', paciente)
                                resolve(paciente)
                            }
                        })
                    }
                });
            })

        }
    }
}
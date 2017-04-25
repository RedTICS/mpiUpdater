import * as http from 'http';
import * as config from './config';

export class PacienteMpi {
    cargarUnPacienteMpi(paciente: any) {

        console.log('entro aca?');
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            console.log('entro al insert de paciente mpi: ', options);
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            /*write data to request body*/
            req.write(JSON.stringify(paciente));
            req.end();
        });

    };
    actualizaUnPacienteMpi(paciente: any) {
        return new Promise((resolve, reject) => {
            let id = paciente._id;
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi + '/' + id,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            /*write data to request body*/
            req.write(JSON.stringify(paciente));
            req.end();
        });

    };

    /*No debería borrarse un paciente de mpi pero dejamos el método por las dudas*/
    borraUnPacienteMpi(id) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi + '/' + id,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
           req.end();
        });
    }
}

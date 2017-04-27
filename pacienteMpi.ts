import * as http from 'http';
import * as config from './config';

export class PacienteMpi {
    cargarUnPacienteMpi(paciente: any, token) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi,
                Authentication: token,
                method: 'POST',
                headers: {
                    'Authorization': token,
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
    actualizaUnPacienteMpi(paciente: any, token) {
        return new Promise((resolve, reject) => {
            let id = paciente._id;
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi + '/' + id,
                method: 'PUT',
                headers: {
                    'Authorization': token,
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
    borraUnPacienteMpi(paciente, token) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi + '/' + paciente._id,
                method: 'DELETE',
                headers: {
                    'Authorization': token,
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

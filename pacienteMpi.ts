import * as http from 'http';

export class PacienteMpi {
    cargarUnPacienteMpi(paciente: any) {
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
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi,
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
    borraUnPacienteMpi(id) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPacienteMpi + id,
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

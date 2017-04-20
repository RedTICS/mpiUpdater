import * as http from 'http';
import * as config from './config';

export class PacienteAndes {
    borraUnPacienteAndes(id) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPaciente + '/' + id,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function (res) {
                res.on('data', function (body) {
                    resolve(body);
                });
            });
            req.on('error', function (e) {
                console.log('Problemas API : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            req.end();
        });
    }
}

import * as http from 'http';
import * as config from './config';

export class PacienteAndes {
    borraUnPacienteAndes(paciente, token) {
        return new Promise((resolve, reject) => {
            let options = {
                host: config.hostApi,
                port: config.portApi,
                path: config.pathPaciente + '/' + paciente._id,
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, function (res) {
                res.on('data', function (body) {
                    console.log('Se ha borrado el paciente', body);
                    resolve(body);
                });
            });
            req.on('error', function (e) {
                console.log('Problemas API al borrar un paciente : ' + e.message + ' ----- ', e);
                reject(e.message);
            });
            req.end();
        });
    }
}

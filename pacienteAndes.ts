import * as http from 'http';

export class PacienteAndes {
borraUnPacienteAndes(id) {
        return new Promise((resolve, reject) => {
            let options = {
                host: 'localhost',
                port: 3002,
                path: '/api/core/mpi/pacientes/' + id,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            console.log('borramos paciente andes', options.path);
            let req = http.request(options, function(res) {
                res.on('data', function(body) {
                    console.log('se ve que lo borro');
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
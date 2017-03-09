import * as http from 'http';

export class EnviarpacienteMpi {
    cargarUnPacienteMpi(paciente: any) {
        return new Promise((resolve, reject) => {
            let options = {
                host: 'localhost',
                port: 3002,
                path: '/api/core/mpi/pacientes/mpi',
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

    }
}

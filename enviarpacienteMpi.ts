import * as config from './config';
import * as http from 'http';

export class EnviarpacienteMpi {
    cargarUnPacienteMpi(paciente: any) {
        return new Promise((resolve, reject) => {
            var options = {
                host:'localhost',
                port: 3002,
                path: '/api/core/mpi/pacientes',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            var jsonData = '';
            var req = http.request(options, function(res) {
                //console.log("statusCode: ", res.statusCode, 'y el mensaje es', res.statusMessage);
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + " ----- ", e);
                reject(e.message);
            });
            // write data to request body
            req.write(JSON.stringify(paciente));
            req.end();
        })

    }

    actualizarPacienteMpi(paciente: any) {

        return new Promise((resolve, reject) => {

            var options = {
                host: 'localhost',
                port: 3002,
                path: '/api/core/mpi/pacientes/' + paciente._id,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            var jsonData = '';
            var req = http.request(options, function(res) {
                //console.log("statusCode: ", res.statusCode, 'y el mensaje es', res.statusMessage);
                res.on('data', function(body) {
                    resolve(body);
                });
            });
            req.on('error', function(e) {
                console.log('Problemas API : ' + e.message + " ----- ", e);
                reject(e.message);
            });
            // write data to request body
            req.write(JSON.stringify(paciente));
            req.end();
        })

    }
}

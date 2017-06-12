import * as operations from './updateMpi';
import * as config from './config';

function mpiUpdaterRun() {
    let token = 'JWT ' + config.tokenApp;
    operations.updatingMpi(token)
                .then(rta => {
                    console.log('finaliza proceso');
                    console.log('Fecha de ejecución: ', new Date().toString());
                })
                .catch((err) => {
                console.error('Error**:' + err);
                });
}

/* Inicio de la app */
mpiUpdaterRun();

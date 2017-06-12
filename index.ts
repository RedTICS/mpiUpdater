import * as operations from './updateMpi';
import * as configPrivate from './config.private';

function mpiUpdaterRun() {
    let token = 'JWT ' + configPrivate.tokenApp;
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

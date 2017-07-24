import * as operations from './updateMpi';
import * as configPrivate from './config.private';

function mpiUpdaterRun() {
    let token = 'JWT ' + configPrivate.token;
    operations.updatingMpi(token)
                .then((rta: any) => {
                    console.log('finaliza proceso');
                    console.log('Fecha de ejecución: ', new Date().toString());
                })
                .catch((err: any) => {
                console.error('Error**:' + err);
            });
}

/* Inicio de la app */
mpiUpdaterRun();

import * as operations from './updateMpi';
import * as autentica from './autenticacion';
import * as config from './config';

autentica.loginApp(config.loginData)
.then(value => {
    // console.log('resultado de la autenticación:', 'JWT ' + value.token);
    value.token = 'JWT ' + value.token;
    operations.updatingMpi(value.token)
        .then(rta => {
        console.log('finaliza proceso');
        })
        .catch((err) => {
            console.error('Error**:' + err)
        });
});

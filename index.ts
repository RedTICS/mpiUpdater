import * as operations from './updateMpi';

operations.updatingMpi()
    .then(rta => {
     console.log('finaliza proceso');
    })
    .catch((err) => {
        console.error('Error**:' + err)
    });


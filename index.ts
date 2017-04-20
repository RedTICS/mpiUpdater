//import { UpdateMpi } from './updateMpi';
import * as operations from './updateMpi';
//let myMpiUpdate = new UpdateMpi;
//myMpiUpdate.updatingMpi()


operations.updatingMpi()
    .then(rta => {
     console.log('finaliza proceso');
    })
    .catch((err) => {
        console.error('Error**:' + err)
    });


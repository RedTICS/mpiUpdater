import { UpdateMpi } from './updateMpi';

let myMpiUpdate = new UpdateMpi;

function run(){
    new Promise(function(resolve, reject){
        resolve(myMpiUpdate.updatingMpi());

    })
    .then(function(rta){
        console.log('finaliza proceso', rta);
        return true;
    })
}
/*iniciamos el proceso de envío al mpi extrayendo los datos de los padientes validados en la colección de pacientes ANDES*/
run();

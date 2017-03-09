import { UpdateMpi } from './updateMpi';

let myMpiUpdate = new UpdateMpi;

function run(){
    let p = new Promise(function(resolve, reject){
        console.log('antes de llamar a updating');
        myMpiUpdate.updatingMpi();
    })
    .then(function(rta){
        console.log(rta);
    })
}
//iniciamos el proceso de envío al mpi extrayendo los datos de los padientes validados en la colección de pacientes ANDES
run()
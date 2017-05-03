
/*Constantes de timeout en caso de necesitarlas*/
export const requestTimeout = 60000;
export const connectionTimeout = 15000;
/*Url de las bd*/
export const urlMongoAndes = 'mongodb://127.0.0.1:27017/andes';
export const urlMongoMpi = 'mongodb://127.0.0.1:27028/andes';
/*Colección*/
export const collection = 'paciente';
/*PATHS*/
export const hostApi = '127.0.0.1';
export const portApi = 3002;
export const pathPaciente = '/api/core/mpi/pacientes';
export const pathPacienteMpi = '/api/core/mpi/pacientes/mpi';
/*CONFIGURACIONES*/
export const loginData = {
                usuario : '11111111',  /* Este usuario es de prueba y corresponde al mpiUpdater */
                password : '1',
                organizacion : '57e9670e52df311059bc8964',
};
export const pesos = {
     identity: 0.3,
     name: 0.3,
     gender: 0.1,
     birthDate: 0.3
};

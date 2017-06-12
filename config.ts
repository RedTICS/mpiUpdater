
/*Constantes de timeout en caso de necesitarlas*/
export const requestTimeout = 60000;
export const connectionTimeout = 15000;

/*Colección*/
export const collection = 'paciente';
/*PATHS*/
export const hostApi = '127.0.0.1';
export const portApi = 3002;
export const pathPaciente = '/api/core/mpi/pacientes';
export const pathPacienteMpi = '/api/core/mpi/pacientes/mpi';
/*CONFIGURACIONES VARIAS*/
export const pesos = {
     identity: 0.3,
     name: 0.3,
     gender: 0.1,
     birthDate: 0.3
};

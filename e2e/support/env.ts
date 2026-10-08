export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5174';
export const API_URL = (process.env.API_URL ?? 'http://localhost:8081/api').replace(/\/$/, '');

// UUID fijos sembrados por qa/sql/seed-specialties.sql: sin ese seed, estos tests no corren.
export const SPECIALTY_CARDIOLOGIA_ID = '58fb1665-b097-11f1-9c8a-040e3cf001d8';
export const SPECIALTY_CARDIOLOGIA_NAME = 'Cardiologia';
export const SPECIALTY_DERMATOLOGIA_ID = '58fb3f44-b097-11f1-9c8a-040e3cf001d8';
export const SPECIALTY_DERMATOLOGIA_NAME = 'Dermatologia';
// Pediatria no tiene especialistas en el seed: sirve para probar el estado vacio del filtro.
export const SPECIALTY_PEDIATRIA_NAME = 'Pediatria';

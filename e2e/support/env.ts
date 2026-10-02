export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5174';
export const API_URL = (process.env.API_URL ?? 'http://localhost:8081/api').replace(/\/$/, '');

// UUID fijos sembrados por qa/sql/seed-specialties.sql: sin ese seed, estos tests no corren.
export const SPECIALTY_CARDIOLOGIA_ID = '58fb1665-b097-11f1-9c8a-040e3cf001d8';
export const SPECIALTY_CARDIOLOGIA_NAME = 'Cardiologia';

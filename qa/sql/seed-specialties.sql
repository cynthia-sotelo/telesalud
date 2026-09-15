-- Datos minimos para poder probar el registro de especialistas y correr
-- la coleccion de Postman contra una base recien creada.
-- Uso: mysql -u root -p telesalud < qa/sql/seed-specialties.sql

INSERT INTO specialties (id, name) VALUES
  (UUID_TO_BIN(UUID()), 'Cardiologia'),
  (UUID_TO_BIN(UUID()), 'Dermatologia'),
  (UUID_TO_BIN(UUID()), 'Pediatria')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT BIN_TO_UUID(id) AS id, name FROM specialties;

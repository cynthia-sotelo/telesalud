-- Datos minimos para poder probar el registro de especialistas y correr
-- la coleccion de Postman contra una base recien creada.
-- Uso: mysql --default-character-set=utf8mb4 -u root -p telesalud < qa/sql/seed-specialties.sql
--
-- Los UUID son FIJOS a proposito: la coleccion de Postman (qa/postman/) los
-- referencia directamente en los casos TC-SPEC-03 y TC-SPEC-04 (filtro por
-- especialidad). Pediatria queda siempre sin especialistas -- es la
-- especialidad "vacia" de TC-SPEC-04, no la uses para registrar a nadie.
-- Pensado para una base nueva: si ya existe una especialidad con el mismo
-- nombre pero otro UUID, la coleccion no va a encontrarla.

INSERT INTO specialties (id, name) VALUES
  (UUID_TO_BIN('58fb1665-b097-11f1-9c8a-040e3cf001d8'), 'Cardiologia'),
  (UUID_TO_BIN('58fb3f44-b097-11f1-9c8a-040e3cf001d8'), 'Dermatologia'),
  (UUID_TO_BIN('21addb7b-bdd2-11f1-8fff-040e3cf001d8'), 'Pediatria')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT BIN_TO_UUID(id) AS id, name FROM specialties;

-- Scripts de validacion de integridad de datos para TeleSalud.
-- Cada query documenta el resultado esperado en un sistema sano.
-- Uso: mysql --default-character-set=utf8mb4 -u root -p telesalud < qa/sql/data-integrity-checks.sql
-- (el flag de charset evita errores de sintaxis con las tildes de los comentarios/alias en algunos clientes)

-- ============================================================
-- 1. Las contraseñas nunca se guardan en texto plano.
-- Esperado: 0 filas (todas deben tener forma de hash BCrypt, largo 60,
-- empiezan con $2a$/$2b$/$2y$).
-- ============================================================
SELECT BIN_TO_UUID(id) AS user_id, email
FROM users
WHERE LENGTH(password) <> 60
   OR password NOT REGEXP '^\\$2[aby]\\$';

-- ============================================================
-- 2. No hay emails duplicados (case-insensitive).
-- Esperado: 0 filas.
-- ============================================================
SELECT LOWER(email) AS email, COUNT(*) AS cantidad
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- ============================================================
-- 3. Ningun horario tiene mas de un turno activo (PENDING o CONFIRMED)
-- al mismo tiempo. Esta regla la aplica BookingServiceImpl a nivel de
-- aplicacion (flag Schedule.booked), no un constraint UNIQUE en la base
-- -- a proposito, para permitir reservar de nuevo un horario despues de
-- cancelar un turno anterior (ver Booking.java). Esta query es la red
-- de seguridad que demuestra que la regla se sostiene igual.
-- Esperado: 0 filas.
-- ============================================================
SELECT BIN_TO_UUID(schedule_id) AS schedule_id, COUNT(*) AS turnos_activos
FROM bookings
WHERE status IN ('PENDING', 'CONFIRMED')
GROUP BY schedule_id
HAVING COUNT(*) > 1;

-- ============================================================
-- 4. El flag Schedule.booked es consistente con si tiene un booking activo.
-- Esperado: 0 filas en ambos sentidos.
-- ============================================================

-- 4a. Horarios marcados como reservados sin ningun booking activo real:
SELECT BIN_TO_UUID(s.id) AS schedule_id
FROM schedules s
WHERE s.booked = 1
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.schedule_id = s.id AND b.status IN ('PENDING', 'CONFIRMED')
  );

-- 4b. Horarios marcados como libres que en realidad tienen un booking activo:
SELECT BIN_TO_UUID(s.id) AS schedule_id
FROM schedules s
JOIN bookings b ON b.schedule_id = s.id AND b.status IN ('PENDING', 'CONFIRMED')
WHERE s.booked = 0;

-- ============================================================
-- 5. Cada turno tiene a lo sumo una reseña (constraint UNIQUE real en
-- reviews.booking_id -- a diferencia del caso de bookings, aca si tiene
-- sentido que sea permanente: una reseña pertenece a esa reserva puntual).
-- Esperado: 0 filas.
-- ============================================================
SELECT BIN_TO_UUID(booking_id) AS booking_id, COUNT(*) AS cantidad_resenas
FROM reviews
GROUP BY booking_id
HAVING COUNT(*) > 1;

-- ============================================================
-- 6. Solo se dejan reseñas sobre turnos que en algun momento estuvieron
-- confirmados (no se puede reseñar algo que nunca se confirmo). Nota: un
-- turno puede cancelarse DESPUES de tener reseña, asi que no filtramos
-- por el estado actual, solo verificamos que no sea imposible que haya
-- llegado a CONFIRMED (chequeo best-effort, no 100% concluyente sin un
-- historial de estados).
-- ============================================================
SELECT BIN_TO_UUID(r.id) AS review_id, b.status AS estado_actual_del_turno
FROM reviews r
JOIN bookings b ON b.id = r.booking_id
WHERE b.status = 'PENDING';

-- ============================================================
-- 7. Cada especialista tiene una especialidad valida (la FK ya lo obliga,
-- esta query es una doble verificacion legible para QA manual).
-- Esperado: 0 filas.
-- ============================================================
SELECT BIN_TO_UUID(sp.id) AS specialist_id
FROM specialists sp
LEFT JOIN specialties s ON s.id = sp.specialty_id
WHERE s.id IS NULL;

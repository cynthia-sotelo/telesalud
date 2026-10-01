package com.telesalud.api.exception;

import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        // Red de seguridad ante condiciones de carrera (dos requests casi
        // simultaneos sobre el mismo recurso) que la validacion de aplicacion
        // no llega a bloquear a tiempo. Ver qa/test-plan.md, seccion Riesgos.
        return build(HttpStatus.CONFLICT, "El recurso ya fue modificado por otra operacion. Intenta de nuevo.");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException ex) {
        // Un campo con un tipo invalido (UUID mal formado, valor que no existe
        // en un enum, JSON mal formado) tira esta excepcion ANTES de que
        // @Valid pueda actuar. Sin este handler, Spring reenvia internamente
        // a /error para armar la respuesta por defecto -- y como /error no
        // esta en permitAll, Spring Security bloquea ese reenvio y devuelve
        // un 403 vacio, ocultando que el problema real era un 400 de datos
        // mal formados. Bug real encontrado en QA-003 (2026-10-01).
        return build(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud tiene datos invalidos o mal formados");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message) {
        ApiError error = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message);
        return ResponseEntity.status(status).body(error);
    }
}

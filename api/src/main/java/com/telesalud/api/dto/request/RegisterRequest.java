package com.telesalud.api.dto.request;

import com.telesalud.api.model.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "la contrasena debe tener al menos 8 caracteres") String password,
        @NotBlank String fullName,
        @NotNull RoleName role,
        UUID specialtyId,
        String bio
) {
}

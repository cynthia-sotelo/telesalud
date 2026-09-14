package com.telesalud.api.dto.response;

import java.util.UUID;

public record SpecialistResponse(
        UUID id, String fullName, String email, String specialtyName, String bio) {
}

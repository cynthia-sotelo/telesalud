package com.telesalud.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(UUID id, int rating, String comment, String patientName, Instant createdAt) {
}

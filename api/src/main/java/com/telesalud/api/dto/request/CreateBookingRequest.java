package com.telesalud.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull UUID scheduleId,
        @Size(max = 300) String reason
) {
}

package com.telesalud.api.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateScheduleRequest(
        @NotNull Instant startsAt,
        @NotNull Instant endsAt
) {
}

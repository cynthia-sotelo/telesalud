package com.telesalud.api.dto.response;

import com.telesalud.api.model.BookingStatus;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID scheduleId,
        String specialistName,
        Instant startsAt,
        Instant endsAt,
        String reason,
        BookingStatus status) {
}

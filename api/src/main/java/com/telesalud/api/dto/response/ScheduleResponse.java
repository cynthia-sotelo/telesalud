package com.telesalud.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ScheduleResponse(UUID id, Instant startsAt, Instant endsAt, boolean booked) {
}

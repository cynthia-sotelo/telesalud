package com.telesalud.api.dto.response;

import com.telesalud.api.model.RoleName;
import java.util.UUID;

public record AuthResponse(String token, UUID userId, String fullName, RoleName role) {
}

package com.telesalud.api.service;

import com.telesalud.api.dto.request.LoginRequest;
import com.telesalud.api.dto.request.RegisterRequest;
import com.telesalud.api.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

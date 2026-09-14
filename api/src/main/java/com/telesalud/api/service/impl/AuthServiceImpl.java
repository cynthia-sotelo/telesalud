package com.telesalud.api.service.impl;

import com.telesalud.api.dto.request.LoginRequest;
import com.telesalud.api.dto.request.RegisterRequest;
import com.telesalud.api.dto.response.AuthResponse;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.RoleName;
import com.telesalud.api.model.Specialist;
import com.telesalud.api.model.Specialty;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.SpecialistRepository;
import com.telesalud.api.repository.SpecialtyRepository;
import com.telesalud.api.repository.UserRepository;
import com.telesalud.api.security.JwtService;
import com.telesalud.api.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final SpecialistRepository specialistRepository;
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            SpecialistRepository specialistRepository,
            SpecialtyRepository specialtyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.specialistRepository = specialistRepository;
        this.specialtyRepository = specialtyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Ya existe una cuenta con ese email");
        }

        if (request.role() == RoleName.SPECIALIST && request.specialtyId() == null) {
            throw new BadRequestException("specialtyId es obligatorio para registrarse como especialista");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user = userRepository.save(user);

        if (request.role() == RoleName.SPECIALIST) {
            Specialty specialty = specialtyRepository.findById(request.specialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada"));

            Specialist specialist = new Specialist();
            specialist.setUser(user);
            specialist.setSpecialty(specialty);
            specialist.setBio(request.bio());
            specialistRepository.save(specialist);
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String token = jwtService.generateToken((UserDetails) user);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getRole());
    }
}

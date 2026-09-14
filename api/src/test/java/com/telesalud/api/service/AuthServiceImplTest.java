package com.telesalud.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telesalud.api.dto.request.RegisterRequest;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.model.RoleName;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.SpecialistRepository;
import com.telesalud.api.repository.SpecialtyRepository;
import com.telesalud.api.repository.UserRepository;
import com.telesalud.api.security.JwtService;
import com.telesalud.api.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private SpecialistRepository specialistRepository;
    @Mock private SpecialtyRepository specialtyRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest patientRequest;

    @BeforeEach
    void setUp() {
        patientRequest = new RegisterRequest(
                "paciente@test.com", "password123", "Paciente Test", RoleName.PATIENT, null, null);
    }

    @Test
    void registraUnPacienteCorrectamente() {
        when(userRepository.existsByEmail(patientRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(patientRequest.password())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(java.util.UUID.randomUUID());
            return u;
        });
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");

        var response = authService.register(patientRequest);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.role()).isEqualTo(RoleName.PATIENT);
    }

    @Test
    void rechazaRegistroConEmailYaExistente() {
        when(userRepository.existsByEmail(patientRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(patientRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Ya existe una cuenta");
    }

    @Test
    void rechazaRegistroDeEspecialistaSinEspecialidad() {
        RegisterRequest specialistWithoutSpecialty = new RegisterRequest(
                "doc@test.com", "password123", "Dr. Test", RoleName.SPECIALIST, null, null);
        when(userRepository.existsByEmail(specialistWithoutSpecialty.email())).thenReturn(false);

        assertThatThrownBy(() -> authService.register(specialistWithoutSpecialty))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("specialtyId");
    }
}

package com.telesalud.api.controller;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telesalud.api.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    @Test
    void flujoCompletoDeRegistroYLogin() throws Exception {
        String registerBody = objectMapper.writeValueAsString(new RegisterPayload(
                "paciente@telesalud.com", "password123", "Paciente E2E", "PATIENT", null, null));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role").value("PATIENT"));

        String loginBody = objectMapper.writeValueAsString(new LoginPayload(
                "paciente@telesalud.com", "password123"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    void loginConCredencialesInvalidasDevuelve401() throws Exception {
        String loginBody = objectMapper.writeValueAsString(new LoginPayload(
                "no-existe@telesalud.com", "cualquierPass"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registroConEmailDuplicadoDevuelve400() throws Exception {
        String registerBody = objectMapper.writeValueAsString(new RegisterPayload(
                "duplicado@telesalud.com", "password123", "Paciente Duplicado", "PATIENT", null, null));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isBadRequest());
    }

    private record RegisterPayload(
            String email, String password, String fullName, String role, Object specialtyId, String bio) {
    }

    private record LoginPayload(String email, String password) {
    }
}

package com.telesalud.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telesalud.api.model.Specialty;
import com.telesalud.api.repository.BookingRepository;
import com.telesalud.api.repository.ReviewRepository;
import com.telesalud.api.repository.ScheduleRepository;
import com.telesalud.api.repository.SpecialistRepository;
import com.telesalud.api.repository.SpecialtyRepository;
import com.telesalud.api.repository.UserRepository;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingFlowIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private SpecialtyRepository specialtyRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SpecialistRepository specialistRepository;
    @Autowired private ScheduleRepository scheduleRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ReviewRepository reviewRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void cleanUp() {
        reviewRepository.deleteAll();
        bookingRepository.deleteAll();
        scheduleRepository.deleteAll();
        specialistRepository.deleteAll();
        userRepository.deleteAll();
        specialtyRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    @Test
    void flujoCompletoDeReservaCancelacionYReseña() throws Exception {
        Specialty specialty = specialtyRepository.save(new Specialty(null, "Cardiologia"));

        String specialistToken = registerAndGetToken(
                "dra.perez@telesalud.com", "password123", "Dra Perez", "SPECIALIST", specialty.getId());
        String patientToken = registerAndGetToken(
                "paciente@telesalud.com", "password123", "Paciente Uno", "PATIENT", null);

        String scheduleBody = objectMapper.writeValueAsString(new ScheduleBody(
                Instant.now().plusSeconds(3600).toString(), Instant.now().plusSeconds(7200).toString()));

        String scheduleJson = mockMvc.perform(post("/api/specialists/me/schedules")
                        .header("Authorization", "Bearer " + specialistToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String scheduleId = objectMapper.readTree(scheduleJson).get("id").asText();

        String bookingBody = objectMapper.writeValueAsString(new BookingBody(scheduleId, "Chequeo anual"));

        String bookingJson = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andReturn().getResponse().getContentAsString();

        // Edge case: no se puede reservar el mismo horario dos veces
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingBody))
                .andExpect(status().isBadRequest());

        String bookingId = objectMapper.readTree(bookingJson).get("id").asText();

        // Reseñar antes de cancelar (turno confirmado) funciona
        String reviewBody = objectMapper.writeValueAsString(new ReviewBody(bookingId, 5, "Muy buena atencion"));
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reviewBody))
                .andExpect(status().isCreated());

        // Edge case: no se puede reseñar dos veces el mismo turno
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reviewBody))
                .andExpect(status().isBadRequest());

        // Cancelar libera el horario
        mockMvc.perform(delete("/api/bookings/" + bookingId)
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/specialists/" + specialistToId(specialty) + "/schedules"))
                .andExpect(status().isOk());
    }

    private String specialistToId(Specialty specialty) {
        return specialistRepository.findBySpecialtyId(specialty.getId()).get(0).getId().toString();
    }

    private String registerAndGetToken(
            String email, String password, String fullName, String role, java.util.UUID specialtyId) throws Exception {
        String body = objectMapper.writeValueAsString(
                new RegisterBody(email, password, fullName, role, specialtyId, "bio de prueba"));

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private record RegisterBody(
            String email, String password, String fullName, String role, java.util.UUID specialtyId, String bio) {
    }

    private record ScheduleBody(String startsAt, String endsAt) {
    }

    private record BookingBody(String scheduleId, String reason) {
    }

    private record ReviewBody(String bookingId, int rating, String comment) {
    }
}

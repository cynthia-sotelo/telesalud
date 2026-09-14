package com.telesalud.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telesalud.api.dto.request.CreateReviewRequest;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.Booking;
import com.telesalud.api.model.BookingStatus;
import com.telesalud.api.model.Review;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.BookingRepository;
import com.telesalud.api.repository.ReviewRepository;
import com.telesalud.api.service.impl.ReviewServiceImpl;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User patient;
    private Booking booking;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(UUID.randomUUID());
        patient.setFullName("Paciente Test");

        booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setPatient(patient);
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    @Test
    void creaReseñaDeTurnoConfirmado() {
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(booking.getId())).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = reviewService.create(patient, new CreateReviewRequest(booking.getId(), 5, "Excelente"));

        assertThat(response.rating()).isEqualTo(5);
    }

    @Test
    void rechazaReseñaDeTurnoNoConfirmado() {
        booking.setStatus(BookingStatus.PENDING);
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> reviewService.create(patient, new CreateReviewRequest(booking.getId(), 4, null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("confirmado");
    }

    @Test
    void rechazaSegundaReseñaSobreElMismoTurno() {
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(booking.getId())).thenReturn(true);

        assertThatThrownBy(() -> reviewService.create(patient, new CreateReviewRequest(booking.getId(), 3, null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya tiene una reseña");
    }

    @Test
    void rechazaReseñaDeTurnoDeOtroPaciente() {
        User otroPaciente = new User();
        otroPaciente.setId(UUID.randomUUID());
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> reviewService.create(otroPaciente, new CreateReviewRequest(booking.getId(), 3, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

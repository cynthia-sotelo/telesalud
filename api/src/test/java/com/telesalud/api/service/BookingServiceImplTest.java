package com.telesalud.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telesalud.api.dto.request.CreateBookingRequest;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.Booking;
import com.telesalud.api.model.BookingStatus;
import com.telesalud.api.model.RoleName;
import com.telesalud.api.model.Schedule;
import com.telesalud.api.model.Specialist;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.BookingRepository;
import com.telesalud.api.repository.ScheduleRepository;
import com.telesalud.api.service.impl.BookingServiceImpl;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ScheduleRepository scheduleRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User patient;
    private Schedule schedule;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(UUID.randomUUID());
        patient.setRole(RoleName.PATIENT);
        patient.setFullName("Paciente Test");

        User specialistUser = new User();
        specialistUser.setId(UUID.randomUUID());
        specialistUser.setFullName("Dr. Test");

        Specialist specialist = new Specialist();
        specialist.setUser(specialistUser);

        schedule = new Schedule();
        schedule.setId(UUID.randomUUID());
        schedule.setSpecialist(specialist);
        schedule.setStartsAt(Instant.now());
        schedule.setEndsAt(Instant.now().plusSeconds(1800));
        schedule.setBooked(false);
    }

    @Test
    void reservaUnTurnoDisponible() {
        when(scheduleRepository.findById(schedule.getId())).thenReturn(java.util.Optional.of(schedule));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.create(patient, new CreateBookingRequest(schedule.getId(), "consulta"));

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(schedule.isBooked()).isTrue();
    }

    @Test
    void rechazaReservaDeHorarioYaReservado() {
        schedule.setBooked(true);
        when(scheduleRepository.findById(schedule.getId())).thenReturn(java.util.Optional.of(schedule));

        assertThatThrownBy(() -> bookingService.create(patient, new CreateBookingRequest(schedule.getId(), null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya esta reservado");
    }

    @Test
    void rechazaReservaSiElUsuarioNoEsPaciente() {
        User specialistAsPatient = new User();
        specialistAsPatient.setId(UUID.randomUUID());
        specialistAsPatient.setRole(RoleName.SPECIALIST);

        assertThatThrownBy(() -> bookingService.create(
                specialistAsPatient, new CreateBookingRequest(schedule.getId(), null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("pacientes");
    }

    @Test
    void cancelarTurnoDeOtroPacienteDaNoEncontrado() {
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        User otroPaciente = new User();
        otroPaciente.setId(UUID.randomUUID());
        booking.setPatient(otroPaciente);
        booking.setSchedule(schedule);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(booking.getId())).thenReturn(java.util.Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancel(patient, booking.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cancelarLiberaElHorario() {
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setPatient(patient);
        booking.setSchedule(schedule);
        booking.setStatus(BookingStatus.CONFIRMED);
        schedule.setBooked(true);

        when(bookingRepository.findById(booking.getId())).thenReturn(java.util.Optional.of(booking));

        bookingService.cancel(patient, booking.getId());

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(schedule.isBooked()).isFalse();
    }
}

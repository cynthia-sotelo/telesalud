package com.telesalud.api.service.impl;

import com.telesalud.api.dto.request.CreateBookingRequest;
import com.telesalud.api.dto.response.BookingResponse;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.Booking;
import com.telesalud.api.model.BookingStatus;
import com.telesalud.api.model.RoleName;
import com.telesalud.api.model.Schedule;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.BookingRepository;
import com.telesalud.api.repository.ScheduleRepository;
import com.telesalud.api.service.BookingService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;

    public BookingServiceImpl(BookingRepository bookingRepository, ScheduleRepository scheduleRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    @Transactional
    public BookingResponse create(User patient, CreateBookingRequest request) {
        if (patient.getRole() != RoleName.PATIENT) {
            throw new BadRequestException("Solo los pacientes pueden reservar turnos");
        }

        Schedule schedule = scheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado"));

        if (schedule.isBooked()) {
            throw new BadRequestException("Ese horario ya esta reservado");
        }

        schedule.setBooked(true);
        scheduleRepository.save(schedule);

        Booking booking = new Booking();
        booking.setPatient(patient);
        booking.setSchedule(schedule);
        booking.setReason(request.reason());
        booking.setStatus(BookingStatus.CONFIRMED);

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> listOwn(User patient) {
        return bookingRepository.findByPatientId(patient.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void cancel(User patient, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .filter(b -> b.getPatient().getId().equals(patient.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("El turno ya estaba cancelado");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.getSchedule().setBooked(false);
        bookingRepository.save(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        Schedule schedule = booking.getSchedule();
        return new BookingResponse(
                booking.getId(),
                schedule.getId(),
                schedule.getSpecialist().getUser().getFullName(),
                schedule.getStartsAt(),
                schedule.getEndsAt(),
                booking.getReason(),
                booking.getStatus());
    }
}

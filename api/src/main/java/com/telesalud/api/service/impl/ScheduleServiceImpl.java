package com.telesalud.api.service.impl;

import com.telesalud.api.dto.request.CreateScheduleRequest;
import com.telesalud.api.dto.response.ScheduleResponse;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.Schedule;
import com.telesalud.api.model.Specialist;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.ScheduleRepository;
import com.telesalud.api.repository.SpecialistRepository;
import com.telesalud.api.service.ScheduleService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SpecialistRepository specialistRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, SpecialistRepository specialistRepository) {
        this.scheduleRepository = scheduleRepository;
        this.specialistRepository = specialistRepository;
    }

    @Override
    public List<ScheduleResponse> listAvailable(UUID specialistId) {
        return scheduleRepository.findBySpecialistIdAndBookedFalse(specialistId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ScheduleResponse create(User specialistUser, CreateScheduleRequest request) {
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new BadRequestException("endsAt debe ser posterior a startsAt");
        }

        Specialist specialist = specialistRepository.findByUserId(specialistUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("El usuario autenticado no tiene perfil de especialista"));

        Schedule schedule = new Schedule();
        schedule.setSpecialist(specialist);
        schedule.setStartsAt(request.startsAt());
        schedule.setEndsAt(request.endsAt());
        schedule.setBooked(false);

        return toResponse(scheduleRepository.save(schedule));
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(), schedule.getStartsAt(), schedule.getEndsAt(), schedule.isBooked());
    }
}

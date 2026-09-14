package com.telesalud.api.service.impl;

import com.telesalud.api.dto.response.SpecialistResponse;
import com.telesalud.api.dto.response.SpecialtyResponse;
import com.telesalud.api.model.Specialist;
import com.telesalud.api.model.Specialty;
import com.telesalud.api.repository.SpecialistRepository;
import com.telesalud.api.repository.SpecialtyRepository;
import com.telesalud.api.service.SpecialistService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SpecialistServiceImpl implements SpecialistService {

    private final SpecialtyRepository specialtyRepository;
    private final SpecialistRepository specialistRepository;

    public SpecialistServiceImpl(SpecialtyRepository specialtyRepository, SpecialistRepository specialistRepository) {
        this.specialtyRepository = specialtyRepository;
        this.specialistRepository = specialistRepository;
    }

    @Override
    public List<SpecialtyResponse> listSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(this::toSpecialtyResponse)
                .toList();
    }

    @Override
    public List<SpecialistResponse> listSpecialists(UUID specialtyId) {
        List<Specialist> specialists = specialtyId != null
                ? specialistRepository.findBySpecialtyId(specialtyId)
                : specialistRepository.findAll();

        return specialists.stream().map(this::toSpecialistResponse).toList();
    }

    private SpecialtyResponse toSpecialtyResponse(Specialty specialty) {
        return new SpecialtyResponse(specialty.getId(), specialty.getName());
    }

    private SpecialistResponse toSpecialistResponse(Specialist specialist) {
        return new SpecialistResponse(
                specialist.getId(),
                specialist.getUser().getFullName(),
                specialist.getUser().getEmail(),
                specialist.getSpecialty().getName(),
                specialist.getBio());
    }
}

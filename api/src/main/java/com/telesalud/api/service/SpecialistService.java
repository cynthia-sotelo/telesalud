package com.telesalud.api.service;

import com.telesalud.api.dto.response.SpecialistResponse;
import com.telesalud.api.dto.response.SpecialtyResponse;
import java.util.List;
import java.util.UUID;

public interface SpecialistService {
    List<SpecialtyResponse> listSpecialties();
    List<SpecialistResponse> listSpecialists(UUID specialtyId);
}

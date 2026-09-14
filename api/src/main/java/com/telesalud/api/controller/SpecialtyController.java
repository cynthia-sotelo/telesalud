package com.telesalud.api.controller;

import com.telesalud.api.dto.response.SpecialtyResponse;
import com.telesalud.api.service.SpecialistService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/specialties")
public class SpecialtyController {

    private final SpecialistService specialistService;

    public SpecialtyController(SpecialistService specialistService) {
        this.specialistService = specialistService;
    }

    @GetMapping
    public List<SpecialtyResponse> list() {
        return specialistService.listSpecialties();
    }
}

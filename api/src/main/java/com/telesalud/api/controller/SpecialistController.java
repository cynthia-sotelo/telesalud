package com.telesalud.api.controller;

import com.telesalud.api.dto.request.CreateScheduleRequest;
import com.telesalud.api.dto.response.ReviewResponse;
import com.telesalud.api.dto.response.ScheduleResponse;
import com.telesalud.api.dto.response.SpecialistResponse;
import com.telesalud.api.model.User;
import com.telesalud.api.service.ReviewService;
import com.telesalud.api.service.ScheduleService;
import com.telesalud.api.service.SpecialistService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/specialists")
public class SpecialistController {

    private final SpecialistService specialistService;
    private final ScheduleService scheduleService;
    private final ReviewService reviewService;

    public SpecialistController(
            SpecialistService specialistService, ScheduleService scheduleService, ReviewService reviewService) {
        this.specialistService = specialistService;
        this.scheduleService = scheduleService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<SpecialistResponse> list(@RequestParam(required = false) UUID specialtyId) {
        return specialistService.listSpecialists(specialtyId);
    }

    @GetMapping("/{id}/schedules")
    public List<ScheduleResponse> availableSchedules(@PathVariable UUID id) {
        return scheduleService.listAvailable(id);
    }

    @GetMapping("/{id}/reviews")
    public List<ReviewResponse> reviews(@PathVariable UUID id) {
        return reviewService.listBySpecialist(id);
    }

    @PostMapping("/me/schedules")
    public ResponseEntity<ScheduleResponse> createSchedule(
            @AuthenticationPrincipal User specialistUser, @Valid @RequestBody CreateScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(specialistUser, request));
    }
}

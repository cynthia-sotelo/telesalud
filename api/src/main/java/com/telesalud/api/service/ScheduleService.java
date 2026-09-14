package com.telesalud.api.service;

import com.telesalud.api.dto.request.CreateScheduleRequest;
import com.telesalud.api.dto.response.ScheduleResponse;
import com.telesalud.api.model.User;
import java.util.List;
import java.util.UUID;

public interface ScheduleService {
    List<ScheduleResponse> listAvailable(UUID specialistId);
    ScheduleResponse create(User specialistUser, CreateScheduleRequest request);
}

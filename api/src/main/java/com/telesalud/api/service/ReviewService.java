package com.telesalud.api.service;

import com.telesalud.api.dto.request.CreateReviewRequest;
import com.telesalud.api.dto.response.ReviewResponse;
import com.telesalud.api.model.User;
import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse create(User patient, CreateReviewRequest request);
    List<ReviewResponse> listBySpecialist(UUID specialistId);
}

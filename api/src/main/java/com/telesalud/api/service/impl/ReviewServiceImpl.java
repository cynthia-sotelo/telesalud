package com.telesalud.api.service.impl;

import com.telesalud.api.dto.request.CreateReviewRequest;
import com.telesalud.api.dto.response.ReviewResponse;
import com.telesalud.api.exception.BadRequestException;
import com.telesalud.api.exception.ResourceNotFoundException;
import com.telesalud.api.model.Booking;
import com.telesalud.api.model.BookingStatus;
import com.telesalud.api.model.Review;
import com.telesalud.api.model.User;
import com.telesalud.api.repository.BookingRepository;
import com.telesalud.api.repository.ReviewRepository;
import com.telesalud.api.service.ReviewService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public ReviewResponse create(User patient, CreateReviewRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .filter(b -> b.getPatient().getId().equals(patient.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Solo se puede reseñar un turno confirmado");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new BadRequestException("Ese turno ya tiene una reseña");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setRating(request.rating());
        review.setComment(request.comment());

        return toResponse(reviewRepository.save(review), patient.getFullName());
    }

    @Override
    public List<ReviewResponse> listBySpecialist(UUID specialistId) {
        return reviewRepository.findByBooking_Schedule_Specialist_Id(specialistId).stream()
                .map(r -> toResponse(r, r.getBooking().getPatient().getFullName()))
                .toList();
    }

    private ReviewResponse toResponse(Review review, String patientName) {
        return new ReviewResponse(
                review.getId(), review.getRating(), review.getComment(), patientName, review.getCreatedAt());
    }
}

package com.telesalud.api.repository;

import com.telesalud.api.model.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByBooking_Schedule_Specialist_Id(UUID specialistId);
    boolean existsByBookingId(UUID bookingId);
}

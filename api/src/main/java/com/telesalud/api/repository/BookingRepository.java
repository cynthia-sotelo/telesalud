package com.telesalud.api.repository;

import com.telesalud.api.model.Booking;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByPatientId(UUID patientId);
    Optional<Booking> findByScheduleId(UUID scheduleId);
}

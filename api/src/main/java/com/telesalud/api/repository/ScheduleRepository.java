package com.telesalud.api.repository;

import com.telesalud.api.model.Schedule;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {
    List<Schedule> findBySpecialistIdAndBookedFalse(UUID specialistId);
}

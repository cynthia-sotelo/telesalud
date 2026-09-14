package com.telesalud.api.repository;

import com.telesalud.api.model.Specialist;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialistRepository extends JpaRepository<Specialist, UUID> {
    List<Specialist> findBySpecialtyId(UUID specialtyId);
    Optional<Specialist> findByUserId(UUID userId);
}

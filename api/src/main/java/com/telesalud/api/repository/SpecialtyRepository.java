package com.telesalud.api.repository;

import com.telesalud.api.model.Specialty;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {
}

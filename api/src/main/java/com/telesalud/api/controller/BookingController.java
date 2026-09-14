package com.telesalud.api.controller;

import com.telesalud.api.dto.request.CreateBookingRequest;
import com.telesalud.api.dto.response.BookingResponse;
import com.telesalud.api.model.User;
import com.telesalud.api.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @AuthenticationPrincipal User patient, @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(patient, request));
    }

    @GetMapping("/me")
    public List<BookingResponse> listOwn(@AuthenticationPrincipal User patient) {
        return bookingService.listOwn(patient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@AuthenticationPrincipal User patient, @PathVariable UUID id) {
        bookingService.cancel(patient, id);
        return ResponseEntity.noContent().build();
    }
}

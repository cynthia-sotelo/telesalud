package com.telesalud.api.service;

import com.telesalud.api.dto.request.CreateBookingRequest;
import com.telesalud.api.dto.response.BookingResponse;
import com.telesalud.api.model.User;
import java.util.List;
import java.util.UUID;

public interface BookingService {
    BookingResponse create(User patient, CreateBookingRequest request);
    List<BookingResponse> listOwn(User patient);
    void cancel(User patient, UUID bookingId);
}

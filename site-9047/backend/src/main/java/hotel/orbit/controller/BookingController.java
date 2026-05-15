package hotel.orbit.controller;

import hotel.orbit.dto.BookingRequest;
import hotel.orbit.model.Booking;
import hotel.orbit.repository.BookingRepository;
import hotel.orbit.service.BookingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping("/confirm")
    public Booking confirm(@RequestBody BookingRequest request) {
        return bookingService.reserve(request);
    }

    @GetMapping
    public List<Booking> all() {
        return bookingRepository.findAll();
    }
}

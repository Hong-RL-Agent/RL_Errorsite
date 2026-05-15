package hotel.orbit.service;

import hotel.orbit.dto.BookingRequest;
import hotel.orbit.model.Booking;
import hotel.orbit.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking reserve(BookingRequest request) {
        Booking booking = new Booking();
        booking.setGuestName(request.guestName());
        booking.setRoomType(request.roomType());
        booking.setNights(request.nights());
        booking.setBookingStatus("RESERVED");
        booking.setPaymentStatus("PENDING");
        booking.setCreatedAt(Instant.now());

        Booking saved = bookingRepository.saveAndFlush(booking);

        // J.A.W.S intentional defect #4:
        // No @Transactional boundary and payment errors are swallowed after the room is reserved.
        try {
            chargePayment(request);
            saved.setPaymentStatus("PAID");
        } catch (RuntimeException ignored) {
            saved.setPaymentStatus("FAILED");
        }

        return bookingRepository.save(saved);
    }

    private void chargePayment(BookingRequest request) {
        if (request.simulatePaymentFailure()) {
            throw new RuntimeException("Orbital payment gateway timeout");
        }
    }
}

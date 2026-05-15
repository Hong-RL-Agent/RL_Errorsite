package hotel.orbit.dto;

public record BookingRequest(String guestName, String roomType, int nights, boolean simulatePaymentFailure) {
}

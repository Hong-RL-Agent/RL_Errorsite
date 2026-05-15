package com.autotruck.control;

import java.math.BigInteger;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class ControlController {
    private final AtomicLong sequence = new AtomicLong(1042);
    private final Random random = new Random(9088);

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "AUTO-TRUCK",
                "port", 9088,
                "status", "nominal",
                "timestamp", Instant.now().toString());
    }

    @GetMapping("/api/fleet")
    public Map<String, Object> fleet() {
        return Map.of(
                "hub", "Seoul-Yongin Autonomous Freight Corridor",
                "timezone", "Asia/Seoul",
                "controlPlane", "http://localhost:9088",
                "trucks", List.of(
                        truck("AT-9088-ALPHA", "Northbound", 37.5665, 127.0280, 83, 87, 71.4, 35.9),
                        truck("AT-9088-BRAVO", "Docking", 37.4138, 127.5183, 31, 91, 68.1, 36.3),
                        truck("AT-9088-CHARLIE", "Eastbound", 36.9910, 127.9259, 96, 79, 74.7, 35.4),
                        truck("AT-9088-DELTA", "Charging", 36.3504, 127.3845, 0, 64, 69.9, 34.8)));
    }

    @GetMapping("/api/telemetry")
    public Map<String, Object> telemetry() {
        long seq = sequence.incrementAndGet();
        double drift = random.nextDouble() * 0.001;
        return Map.of(
                "sequence", seq,
                "serverUtc", Instant.now().toString(),
                "serverLocal", DateTimeFormatter.ISO_OFFSET_DATE_TIME.withZone(ZoneOffset.ofHours(9)).format(Instant.now()),
                "fuelAdditive", 0.1 + 0.2,
                "steeringRadians", 0.1 + 0.7,
                "oversizeShipmentId", new BigInteger("922337203685477580812345"),
                "averageSpeedKph", 82.4 + drift,
                "network", Map.of("latencyMs", 188 + random.nextInt(260), "packetLoss", random.nextDouble() / 18),
                "tires", List.of(35.9 + drift, 36.2, 35.8, 36.1, 35.7, 36.4));
    }

    @GetMapping("/api/long-poll/status")
    public Map<String, Object> longPollStatus() throws InterruptedException {
        Thread.sleep(12000);
        return Map.of(
                "message", "Delayed convoy arbitration response",
                "createdAt", Instant.now().toString(),
                "risk", "client has no timeout");
    }

    @GetMapping(path = "/api/events/location", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter locationEvents() {
        SseEmitter emitter = new SseEmitter(0L);
        Thread eventThread = new Thread(() -> {
            try {
                List<Map<String, Object>> batch = new ArrayList<>();
                for (int i = 0; i < 8; i++) {
                    long seq = sequence.incrementAndGet();
                    batch.add(Map.of(
                            "sequence", seq,
                            "truckId", i % 2 == 0 ? "AT-9088-ALPHA" : "AT-9088-CHARLIE",
                            "lat", 37.2 + random.nextDouble() * .4,
                            "lng", 127.0 + random.nextDouble() * .6,
                            "speed", 72 + random.nextInt(34),
                            "emittedAt", Instant.now().minusMillis(random.nextInt(900)).toString()));
                }
                batch.sort(Comparator.comparing(item -> item.get("emittedAt").toString()));
                for (Map<String, Object> event : batch) {
                    emitter.send(SseEmitter.event().name("location").data(event));
                    Thread.sleep(850);
                }
            } catch (Exception ignored) {
                emitter.completeWithError(ignored);
            }
        });
        eventThread.setName("auto-truck-9088-location-sse");
        eventThread.setDaemon(true);
        eventThread.start();
        return emitter;
    }

    private Map<String, Object> truck(String id, String state, double lat, double lng, int speed, int fuel, double batteryTemp, double tirePsi) {
        return Map.of(
                "id", id,
                "state", state,
                "lat", lat,
                "lng", lng,
                "speed", speed,
                "fuel", fuel,
                "batteryTemp", batteryTemp,
                "tirePsi", tirePsi,
                "updatedAt", Instant.now().toString());
    }
}

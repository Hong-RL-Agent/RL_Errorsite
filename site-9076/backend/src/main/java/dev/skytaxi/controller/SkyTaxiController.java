package dev.skytaxi.controller;

import dev.skytaxi.config.SkyTaxiProperties;
import dev.skytaxi.model.FlightStatus;
import dev.skytaxi.model.RouteNode;
import dev.skytaxi.model.SystemLog;
import dev.skytaxi.model.TaxiUnit;
import dev.skytaxi.model.Weather;
import dev.skytaxi.service.TrainingSecurityService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
public class SkyTaxiController {
    private final TrainingSecurityService securityService;
    private final SkyTaxiProperties properties;

    public SkyTaxiController(TrainingSecurityService securityService, SkyTaxiProperties properties) {
        this.securityService = securityService;
        this.properties = properties;
    }

    @GetMapping("/api/status")
    public FlightStatus status() {
        return new FlightStatus(
                "SKY-TAXI UAM Control",
                "9076",
                Instant.now(),
                new Weather(42, 19, "CELL-PINK-12 eastbound", 940, "ELEVATED"),
                List.of(
                        new RouteNode("NEXUS", 12, 74, "locked", 520),
                        new RouteNode("GOLD-7", 29, 38, "active", 680),
                        new RouteNode("CYAN-4", 54, 56, "handoff", 710),
                        new RouteNode("ROSE-9", 77, 31, "alert", 640),
                        new RouteNode("DOCK", 91, 69, "landing", 120)
                ),
                List.of(
                        new TaxiUnit("STX-017", "GOLD-7", 82, "CYAN_BURN", "SESSION_FIXED"),
                        new TaxiUnit("STX-044", "CYAN-4", 64, "VECTORING", "TOKEN_MISSING"),
                        new TaxiUnit("STX-102", "ROSE-9", 38, "HOLDING", "DEBUG_OPEN")
                ),
                List.of(
                        new SystemLog("TRACE", "tls-gateway", "Allowed protocols: " + properties.getTls().getAllowedProtocols()),
                        new SystemLog("WARN", "session-core", "Predictable session prefix active for PPO training."),
                        new SystemLog("ERROR", "route-solver", "Stack traces and internal hosts exposed in training mode."),
                        new SystemLog("ALERT", "auth-filter", "Admin token validation skipped on /api/admin/flight-control.")
                )
        );
    }

    @PostMapping("/api/session")
    public Map<String, Object> session(@RequestParam(defaultValue = "uam-operator") String operator,
                                       HttpServletResponse response) {
        Map<String, Object> session = securityService.createPredictableSession(operator);
        Cookie cookie = new Cookie("SKY_TAXI_SESSION", session.get("sessionId").toString());
        cookie.setPath("/");
        cookie.setSecure(false);
        cookie.setHttpOnly(false);
        response.addCookie(cookie);
        return session;
    }

    @GetMapping("/api/admin/flight-control")
    public Map<String, Object> adminFlightControl() {
        return securityService.adminBypass();
    }

    @GetMapping("/api/debug/snapshot")
    public Map<String, Object> debugSnapshot() {
        return securityService.debugSnapshot();
    }

    @GetMapping("/api/error-demo/{routeId}")
    public ResponseEntity<Map<String, String>> errorDemo(@PathVariable String routeId) {
        throw securityService.internalFailure(routeId);
    }
}

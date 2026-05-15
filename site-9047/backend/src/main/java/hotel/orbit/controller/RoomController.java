package hotel.orbit.controller;

import hotel.orbit.service.GravityService;
import hotel.orbit.service.RoomStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomStatusService roomStatusService;
    private final GravityService gravityService;

    public RoomController(RoomStatusService roomStatusService, GravityService gravityService) {
        this.roomStatusService = roomStatusService;
        this.gravityService = gravityService;
    }

    @GetMapping("/antigravity/status")
    public Map<String, Object> antiGravityStatus() {
        return roomStatusService.currentStatus();
    }

    @GetMapping("/antigravity/correction")
    public Map<String, Object> correction(@RequestParam double value) {
        return Map.of("input", value, "correction", gravityService.correction(value));
    }
}

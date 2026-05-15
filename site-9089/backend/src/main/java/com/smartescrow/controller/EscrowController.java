package com.smartescrow.controller;

import com.smartescrow.model.BrowserSignal;
import com.smartescrow.model.EscrowSnapshot;
import com.smartescrow.model.UploadResult;
import com.smartescrow.service.EscrowService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EscrowController {
    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @GetMapping("/health")
    Map<String, Object> health() {
        return Map.of("status", "UP", "port", 9089, "time", Instant.now().toString());
    }

    @GetMapping("/escrow/snapshot")
    EscrowSnapshot snapshot() {
        return escrowService.snapshot();
    }

    @PostMapping("/browser/signal")
    BrowserSignal signal(@Valid @RequestBody BrowserSignal signal) {
        return escrowService.recordSignal(signal);
    }

    @PostMapping(value = "/escrow/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    UploadResult upload(@RequestPart("file") MultipartFile file) throws IOException {
        return escrowService.inspectUpload(file);
    }
}

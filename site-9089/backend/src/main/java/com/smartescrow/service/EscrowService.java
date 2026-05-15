package com.smartescrow.service;

import com.smartescrow.model.BrowserSignal;
import com.smartescrow.model.EscrowSnapshot;
import com.smartescrow.model.UploadResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class EscrowService {
    private final List<BrowserSignal> signals = new ArrayList<>();

    public EscrowSnapshot snapshot() {
        long height = 92_841_000L + ThreadLocalRandom.current().nextLong(1_000);
        double locked = 48_000_000 + ThreadLocalRandom.current().nextDouble(900_000);
        return new EscrowSnapshot(
                "SMART-ESCROW-L2-9089",
                height,
                Math.round(locked * 100.0) / 100.0,
                ThreadLocalRandom.current().nextInt(2, 9),
                ThreadLocalRandom.current().nextInt(3, 14),
                List.of("Aegis Capital", "Northstar Trust", "BlueVault DAO", "K-Seal Auditor"),
                List.of(
                        "0x9f02...A11C :: milestone lock confirmed",
                        "0x41b7...90FE :: multi-sig quorum pending",
                        "0x88d1...77B2 :: oracle attestation received",
                        "0x6c21...E0F9 :: dispute window extended"
                ),
                Instant.now()
        );
    }

    public BrowserSignal recordSignal(BrowserSignal signal) {
        signals.add(signal);
        return signal;
    }

    public UploadResult inspectUpload(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename() == null ? "unnamed" : file.getOriginalFilename();
        String declared = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        String lower = name.toLowerCase(Locale.ROOT);
        boolean riskyMismatch = lower.endsWith(".pdf") && !declared.equals("application/pdf");
        String verdict = riskyMismatch ? "MIME_MISMATCH_SIMULATED_CRASH_RISK" : "ACCEPTED_FOR_ESCROW_REVIEW";
        return new UploadResult(
                name,
                declared,
                file.getBytes().length,
                verdict,
                "Training endpoint intentionally exposes weak MIME trust behavior for regression detection."
        );
    }
}

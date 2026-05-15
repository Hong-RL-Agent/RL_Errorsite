package com.metamart.controller;

import com.metamart.sim.MicroArchSimService;
import com.metamart.sim.SimResult;
import com.metamart.sim.TelemetrySnapshot;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MetaMartController {
    private final MicroArchSimService simService;

    public MetaMartController(MicroArchSimService simService) {
        this.simService = simService;
    }

    @GetMapping("/inventory")
    public List<Map<String, Object>> inventory() {
        return List.of(
                Map.of("sku", "META-SNEAKER-77", "name", "Holo Runner X", "zone", "Neon Atrium", "price", 239, "vramMb", 92, "rarity", "Legendary"),
                Map.of("sku", "META-JACKET-12", "name", "Flux Weave Jacket", "zone", "Chrome Arcade", "price", 410, "vramMb", 128, "rarity", "Epic"),
                Map.of("sku", "META-DRONE-08", "name", "Cart Drone Companion", "zone", "Sky Retail Lane", "price", 119, "vramMb", 64, "rarity", "Rare"),
                Map.of("sku", "META-VISOR-99", "name", "Cyan Retina Visor", "zone", "Optic Vault", "price", 305, "vramMb", 156, "rarity", "Mythic")
        );
    }

    @GetMapping("/telemetry")
    public TelemetrySnapshot telemetry() {
        return simService.snapshot();
    }

    @PostMapping("/simulate/render-asset")
    public SimResult renderAsset() {
        return simService.renderAsset();
    }

    @PostMapping("/simulate/texture-sync")
    public SimResult textureSync() {
        return simService.textureSync();
    }

    @PostMapping("/simulate/rcu-stall")
    public SimResult rcuStall() {
        return simService.triggerRcuStall();
    }

    @PostMapping("/simulate/transaction-log")
    public SimResult transactionLog() {
        return simService.appendTransactionLog();
    }

    @PostMapping("/simulate/shader")
    public SimResult shader() {
        return simService.executeShader();
    }

    @PostMapping("/simulate/discount")
    public SimResult discount() {
        return simService.calculateDiscount();
    }

    @PostMapping("/simulate/checkout")
    public SimResult checkout() {
        return simService.checkoutWithPriorityInversion();
    }
}

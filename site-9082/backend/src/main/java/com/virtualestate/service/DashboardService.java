package com.virtualestate.service;

import com.virtualestate.model.Asset;
import com.virtualestate.model.DashboardResponse;
import com.virtualestate.model.SecurityEvent;
import com.virtualestate.model.WirelessSignal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DashboardService {
    public DashboardResponse snapshot() {
        List<Asset> assets = List.of(
                new Asset("VE-PENT-001", "Obsidian Sky Penthouse", "Seoul Meta District", "Prime", 184_000_000L, 96, "Escrow protected"),
                new Asset("VE-VLTA-014", "Aurum Vault Residence", "Singapore Ledger Bay", "Ultra", 221_500_000L, 92, "Identity recheck"),
                new Asset("VE-ISLE-077", "Emerald Private Island", "Dubai Mirror Coast", "Sovereign", 310_000_000L, 89, "Wireless anomaly")
        );

        List<WirelessSignal> wirelessSignals = List.of(
                new WirelessSignal("RF-01", "Wi-Fi", "Executive WPA2 Mesh", 71, "5 GHz", "KRACK replay pattern", "Handshake retransmission spike"),
                new WirelessSignal("RF-02", "Bluetooth", "Admin Tablet BLE", 83, "2.4 GHz", "Untrusted pairing", "Stack probe signature"),
                new WirelessSignal("RF-03", "Rogue AP", "VIRTUAL-ESTATE_GUEST_SECURE", 64, "6 GHz", "Unapproved BSSID", "SSID impersonation")
        );

        List<SecurityEvent> events = List.of(
                event("EVT-001", "Network", "Pass-the-Ticket possibility", "Kerberos service ticket reused against asset escrow API", "Critical", "Identity plane", 91, "Expire tickets and force privileged account re-authentication"),
                event("EVT-002", "Network", "NTLM relay scenario", "Intercepted NTLM challenge forwarded between SMB and estate contract portal", "High", "Transaction subnet", 86, "Enforce SMB signing and restrict NTLM"),
                event("EVT-003", "Wireless", "Bluetooth stack exposure", "Admin device accepted suspicious BLE negotiation near control lounge", "High", "Penthouse operations suite", 84, "Disable pairing and quarantine endpoint"),
                event("EVT-004", "Wireless", "KRACK encryption degradation", "WPA2 handshake replay sequence observed on broker Wi-Fi", "High", "Broker floor", 88, "Patch clients and rotate wireless credentials"),
                event("EVT-005", "Wireless", "Rogue AP discovered", "Unknown access point mimics internal guest SSID", "Critical", "Private auction hall", 93, "Locate transmitter and isolate switch uplink"),
                event("EVT-006", "Physical", "Server room door opened", "Door contact triggered outside maintenance window without badge match", "Critical", "Server room B2", 95, "Dispatch guard and correlate CCTV"),
                event("EVT-007", "Physical", "Tailgating detected", "Two silhouettes crossed after a single badge authorization", "High", "Executive entrance", 90, "Lock turnstile and validate identities"),
                event("EVT-008", "Physical", "Dumpster diving recovery trace", "Retired device serial found in external recovery workstation telemetry", "Medium", "Asset disposal chain", 78, "Audit wipe certificates and disposal vendor"),
                event("EVT-009", "Physical", "Shoulder surfing risk", "Camera angle overlaps password entry at wealth kiosk", "Medium", "Lobby concierge", 74, "Install privacy filter and migrate to passkeys"),
                event("EVT-010", "Physical", "Bugging signal captured", "Meeting room RF spectrum spike and voice archive hash drift", "High", "Boardroom Aurum", 87, "Perform RF sweep and integrity review"),
                event("EVT-011", "Physical", "Laser microphone simulation", "Window vibration pattern correlates with external reflection pulses", "High", "Glass suite 57F", 82, "Apply damping film and white-noise masking")
        );

        DashboardResponse.Metrics metrics = new DashboardResponse.Metrics(
                assets.stream().mapToLong(Asset::valuationUsd).sum(),
                38,
                82,
                94,
                3
        );

        return new DashboardResponse(
                "VIRTUAL-ESTATE",
                "http://localhost:9082",
                metrics,
                assets,
                wirelessSignals,
                events
        );
    }

    private SecurityEvent event(String id, String category, String title, String signal, String severity, String location, int confidence, String action) {
        return new SecurityEvent(id, Instant.now().toString(), category, title, signal, severity, location, confidence, action);
    }
}

package com.virtualstadium.control.service;

import com.virtualstadium.control.model.HeatCell;
import com.virtualstadium.control.model.Incident;
import com.virtualstadium.control.model.NetworkTelemetry;
import com.virtualstadium.control.model.OperationLog;
import com.virtualstadium.control.model.RouteStatus;
import com.virtualstadium.control.model.StadiumSnapshot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class StadiumTelemetryService {
    private final String venue;

    public StadiumTelemetryService(@Value("${virtual-stadium.venue:MAGENTA DOME PRIME}") String venue) {
        this.venue = venue;
    }

    public StadiumSnapshot currentSnapshot() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int viewers = 1_820_000 + random.nextInt(180_000);
        int sessions = 642_000 + random.nextInt(58_000);
        double pulse = 88 + random.nextDouble(10);
        double bitrate = 71 + random.nextDouble(18);
        double packetLoss = 0.8 + random.nextDouble(4.2);

        return new StadiumSnapshot(
                venue,
                Instant.now(),
                viewers,
                sessions,
                round(pulse),
                round(bitrate),
                round(packetLoss),
                heatmap(random),
                network(random),
                incidents(),
                operationLogs()
        );
    }

    public List<Incident> incidents() {
        return List.of(
                new Incident("ASYM-RT-01", "비대칭 라우팅", "CRITICAL", "응답 패킷이 다른 POP 경로로 이탈", "return-path pinning 및 flow hash 재검증"),
                new Incident("SNAT-EX-02", "SNAT 포트 고갈", "HIGH", "대규모 동시 접속 후 NAT pool 92% 사용", "NAT gateway scale-out 및 connection reuse"),
                new Incident("BW-SAT-03", "대역폭 포화", "CRITICAL", "4K 멀티뷰 스트림 폭주로 uplink saturation", "ABR bitrate ladder 강제 하향"),
                new Incident("WS-REC-04", "웹소켓 재연결 실패", "HIGH", "끊긴 세션이 exponential backoff 없이 정지", "heartbeat timeout과 jitter backoff 적용"),
                new Incident("BGP-BH-05", "BGP 블랙홀", "CRITICAL", "특정 경기 하이라이트 경로가 null route로 광고", "route-map rollback 및 prefix validation"),
                new Incident("MTU-06", "MTU 불일치", "MEDIUM", "1500 byte 패킷이 1400 MTU 터널에서 드롭", "PMTUD 활성화 및 MSS clamping"),
                new Incident("CDN-CACHE-07", "엣지 캐시 정합성 오류", "MEDIUM", "오염된 스코어보드 JSON이 일부 노드에 잔류", "cache purge와 signed version key 적용"),
                new Incident("DDOS-08", "DDoS 자원 고갈", "CRITICAL", "봇 트래픽 스파이크로 worker queue 증가", "rate limit, challenge, scrubbing center 우회"),
                new Incident("DEPLOY-09", "불완전 배포", "HIGH", "일부 origin만 신규 manifest를 반영", "canary gate와 deployment inventory 검증"),
                new Incident("DRIFT-10", "Config 드리프트", "MEDIUM", "수동 변경된 timeout 값이 선언형 설정과 불일치", "GitOps reconcile 및 drift alert"),
                new Incident("SECRET-11", "Secret 만료", "CRITICAL", "만료된 CDN origin token으로 전체 연결 차단", "secret rotation window와 expiry SLO")
        );
    }

    private NetworkTelemetry network(ThreadLocalRandom random) {
        return new NetworkTelemetry(
                "ICN-MAGENTA-1",
                218_000 + random.nextInt(4000),
                3,
                1400,
                1500,
                58_800 + random.nextInt(2000),
                64_000,
                round(89 + random.nextDouble(4)),
                round(91 + random.nextDouble(8)),
                List.of(
                        new RouteStatus("viewer -> edge-seoul -> origin-a", "ASYMMETRIC", 88, 0.91, "return path mismatch"),
                        new RouteStatus("edge-tokyo -> bgp-core -> replay-vod", "BLACKHOLED", 214, 0.03, "invalid route-map"),
                        new RouteStatus("arena-ws -> fan-pulse-bus", "DEGRADED", 145, 0.78, "websocket reconnect stuck"),
                        new RouteStatus("cdn-edge-17 -> scoreboard-cache", "STALE", 42, 0.64, "poisoned cache object"),
                        new RouteStatus("deploy-runner -> origin-pool", "PARTIAL", 63, 0.57, "incomplete rollout")
                )
        );
    }

    private List<HeatCell> heatmap(ThreadLocalRandom random) {
        String[] moods = {"ROAR", "CHANT", "SURGE", "FLASH", "OVERTIME"};
        return List.of(
                new HeatCell("N-101", 72 + random.nextInt(26), 39 + random.nextInt(24), moods[random.nextInt(moods.length)]),
                new HeatCell("N-204", 62 + random.nextInt(34), 44 + random.nextInt(30), moods[random.nextInt(moods.length)]),
                new HeatCell("E-116", 80 + random.nextInt(19), 53 + random.nextInt(34), moods[random.nextInt(moods.length)]),
                new HeatCell("E-302", 55 + random.nextInt(35), 71 + random.nextInt(44), moods[random.nextInt(moods.length)]),
                new HeatCell("S-118", 69 + random.nextInt(29), 47 + random.nextInt(30), moods[random.nextInt(moods.length)]),
                new HeatCell("S-409", 48 + random.nextInt(44), 92 + random.nextInt(40), moods[random.nextInt(moods.length)]),
                new HeatCell("W-122", 84 + random.nextInt(15), 61 + random.nextInt(28), moods[random.nextInt(moods.length)]),
                new HeatCell("W-280", 58 + random.nextInt(31), 75 + random.nextInt(38), moods[random.nextInt(moods.length)])
        );
    }

    private List<OperationLog> operationLogs() {
        String now = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        return List.of(
                new OperationLog(now, "bgp-watch", "WARN", "prefix 10.98.0.0/18 advertised to blackhole community"),
                new OperationLog(now, "snat-pool", "ERROR", "available ephemeral ports below 8 percent"),
                new OperationLog(now, "ws-gateway", "WARN", "18,420 client sessions missing reconnect attempts"),
                new OperationLog(now, "deploy", "ERROR", "origin-7 and origin-8 still serving build 2026.05.05-a"),
                new OperationLog(now, "secret-rotator", "FATAL", "cdn-origin-token expired; connection gate closed")
        );
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}

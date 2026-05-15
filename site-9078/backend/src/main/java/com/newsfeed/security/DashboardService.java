package com.newsfeed.security;

import com.newsfeed.security.ApiModels.DashboardPayload;
import com.newsfeed.security.ApiModels.IncidentPattern;
import com.newsfeed.security.ApiModels.InventoryItem;
import com.newsfeed.security.ApiModels.NetworkTrace;
import com.newsfeed.security.ApiModels.NewsItem;
import com.newsfeed.security.ApiModels.PreferenceMetric;
import com.newsfeed.security.ApiModels.RouteHop;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DashboardService {
    public DashboardPayload payload() {
        return new DashboardPayload(news(), preferences(), inventory(), traces(), incidents());
    }

    public List<NewsItem> news() {
        return List.of(
            new NewsItem("nf-001", "동아시아 해저 케이블 경로 이상으로 국제면 속보 지연", "World", "Global Desk", "breaking",
                "BGP 우회 경로와 DNS 응답 불일치가 동시에 관측되어 편집국 배포 큐가 격리되었습니다.", 61, Instant.now().toString(),
                List.of("BGP-HIJACK", "DNS-SPOOF", "MITM")),
            new NewsItem("nf-002", "추천 엔진 패키지 업데이트 이후 독자 세그먼트가 비정상 확장", "Technology", "Platform", "analysis",
                "서드파티 패키지 자동 업데이트가 의심스러운 텔레메트리 훅을 포함해 공급망 사고로 분류되었습니다.", 48, Instant.now().minusSeconds(480).toString(),
                List.of("SUPPLY-CHAIN", "LICENSE-RISK")),
            new NewsItem("nf-003", "파트너 미디어 로그인 페이지에서 관리자 토큰 재사용 시도 포착", "Business", "Partner Wire", "alert",
                "워터링 홀 감염 페이지가 뉴스 편성 관리자 권한 상승을 유도한 정황이 있습니다.", 35, Instant.now().minusSeconds(980).toString(),
                List.of("WATERING-HOLE", "INSIDER")),
            new NewsItem("nf-004", "광고 입찰 트래픽 폭주 중 API 레이트 리미터 우회", "Markets", "Ad Ops", "breaking",
                "DDoS 방어 로직이 우선순위 큐의 예외 경로에서 비활성화되어 피드 가용성이 저하되었습니다.", 52, Instant.now().minusSeconds(1500).toString(),
                List.of("DDOS-FAIL", "CRYPTOJACKING")),
            new NewsItem("nf-005", "장기 기획 기사 저장소가 암호화되어 편집 이력 접근 불가", "Culture", "Editorial Ops", "alert",
                "콘텐츠 아카이브의 일부 볼륨이 랜섬웨어 시뮬레이션 상태로 전환되었습니다.", 29, Instant.now().minusSeconds(2400).toString(),
                List.of("RANSOMWARE", "PLAINTEXT-SECRET"))
        );
    }

    public List<PreferenceMetric> preferences() {
        return List.of(
            new PreferenceMetric("정치", 74, "#B91C1C"),
            new PreferenceMetric("국제", 68, "#1D4ED8"),
            new PreferenceMetric("기술", 82, "#E5E7EB"),
            new PreferenceMetric("경제", 57, "#A3A3A3"),
            new PreferenceMetric("문화", 41, "#737373")
        );
    }

    public List<InventoryItem> inventory() {
        return List.of(
            new InventoryItem("news-feed-api", "Spring Boot", "3.3.5", "Platform", "High", "DDoS fallback disabled under burst mode"),
            new InventoryItem("postgres-chart", "Helm", "0.9.7", "Data", "Critical", "Plaintext DB password in values.yaml"),
            new InventoryItem("reader-segmenter", "Package", "2.4.1", "Growth", "High", "Unapproved copyleft dependency marker"),
            new InventoryItem("edge-cache", "Nginx", "1.27", "Infra", "Medium", "TLS termination simulated as weak certificate exposure"),
            new InventoryItem("audit-log", "Volume", "2026.05", "Security", "Critical", "Insider log deletion and export scenario")
        );
    }

    public List<NetworkTrace> traces() {
        return List.of(
            new NetworkTrace("trace-bgp", "Seoul Reader -> Global Desk", "intercepted", List.of(
                new RouteHop("reader-kr", "client", "KR", 9, "clean"),
                new RouteHop("as64512", "isp", "APAC", 22, "clean"),
                new RouteHop("as64496", "unexpected-asn", "unknown", 88, "hijacked"),
                new RouteHop("news-edge-9078", "edge", "US", 141, "degraded")
            )),
            new NetworkTrace("trace-dns", "Resolver -> Article CDN", "spoofed", List.of(
                new RouteHop("dns-cache", "resolver", "KR", 4, "clean"),
                new RouteHop("poisoned-answer", "dns", "unknown", 17, "spoofed"),
                new RouteHop("partner-login-clone", "host", "EU", 73, "malicious")
            ))
        );
    }

    public List<IncidentPattern> incidents() {
        return List.of(
            new IncidentPattern(1, "Helm Chart plaintext DB password", "Critical", "Helm", "values.yaml exposes NEWSFEED_DB_PASSWORD", "helm-render: secret detected in plain text"),
            new IncidentPattern(2, "Unauthorized copyleft package", "High", "License", "GPL-style dependency marker without approval", "license-scan: legal review missing"),
            new IncidentPattern(3, "Ransomware archive encryption", "Critical", "Storage", "article_archive.enc blocks editorial reads", "storage-agent: content locked"),
            new IncidentPattern(4, "Cryptojacking resource drain", "High", "Compute", "background miner consumes CPU shares", "node-exporter: cpu_steal spike"),
            new IncidentPattern(5, "DDoS defense failure", "Critical", "Availability", "rate limiter bypassed on priority traffic", "edge-waf: burst queue exhausted"),
            new IncidentPattern(6, "BGP hijacking", "Critical", "Network", "unexpected ASN appears in trace", "route-monitor: origin mismatch"),
            new IncidentPattern(7, "DNS spoofing", "High", "DNS", "resolver returns partner-login-clone", "dns-watch: answer drift"),
            new IncidentPattern(8, "Weak transport encryption", "High", "TLS", "expired certificate fingerprint exposed", "tls-scan: weak chain"),
            new IncidentPattern(9, "Watering hole partner page", "High", "Partner", "admin login lure on media partner page", "browser-isolation: credential prompt blocked"),
            new IncidentPattern(10, "Malicious package update", "Critical", "Supply Chain", "postinstall telemetry hook", "package-watch: unexpected script"),
            new IncidentPattern(11, "Insider log deletion and export", "Critical", "Audit", "audit rows removed before export event", "siem: delete-before-read pattern")
        );
    }
}

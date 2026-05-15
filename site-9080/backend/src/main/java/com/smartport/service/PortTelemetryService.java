package com.smartport.service;

import com.smartport.model.ComplianceItem;
import com.smartport.model.ContainerSlot;
import com.smartport.model.DashboardSnapshot;
import com.smartport.model.MemoryTelemetry;
import com.smartport.model.VesselSchedule;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PortTelemetryService {
    public DashboardSnapshot snapshot() {
        return new DashboardSnapshot(
                "http://localhost:9080",
                containers(),
                schedules(),
                memoryTelemetry(),
                complianceItems(),
                11,
                18,
                82.7
        );
    }

    public List<ContainerSlot> containers() {
        return List.of(
                new ContainerSlot("SP-CN-1041", "A01", 24, 32, "secure", "reefers", 18, "35.0968,129.0370"),
                new ContainerSlot("SP-CN-1042", "A02", 88, 32, "watch", "lithium", 61, "35.0970,129.0381"),
                new ContainerSlot("SP-CN-1043", "A03", 152, 32, "critical", "medical", 91, "35.0973,129.0389"),
                new ContainerSlot("SP-CN-2088", "B01", 24, 96, "secure", "textile", 22, "35.0959,129.0364"),
                new ContainerSlot("SP-CN-2090", "B02", 88, 96, "watch", "card-data", 73, "35.0962,129.0372"),
                new ContainerSlot("SP-CN-3112", "C01", 24, 160, "critical", "biometric", 96, "35.0951,129.0356"),
                new ContainerSlot("SP-CN-3117", "C02", 88, 160, "secure", "steel", 15, "35.0948,129.0361"),
                new ContainerSlot("SP-CN-4124", "D01", 152, 160, "watch", "worker-health", 84, "35.0945,129.0367")
        );
    }

    public List<VesselSchedule> schedules() {
        return List.of(
                new VesselSchedule("MV Orion Stack", "IMO 9410017", "B-04", "Discharge", "2026-05-05T14:20+09:00", "2026-05-05T22:50+09:00", 6840, "berthing"),
                new VesselSchedule("Hanjin Meridian", "IMO 9733312", "C-02", "Load", "2026-05-05T18:10+09:00", "2026-05-06T03:40+09:00", 5120, "scheduled"),
                new VesselSchedule("Pacific Ledger", "IMO 9328848", "A-01", "Customs hold", "2026-05-06T01:30+09:00", "2026-05-06T10:00+09:00", 4380, "inspection")
        );
    }

    public MemoryTelemetry memoryTelemetry() {
        return new MemoryTelemetry(
                true,
                true,
                "0x7ff6_42a0_0000",
                List.of("ret; pop rdi; ret", "mov [rax], rdx; ret", "jmp rsp"),
                88,
                "학습용 관측값: 주소 노출과 ROP 유사 문자열을 취약 신호로 분류"
        );
    }

    public List<ComplianceItem> complianceItems() {
        return List.of(
                new ComplianceItem("PIPA-CONSENT-01", "PIPA", "필수 고지 및 동의 누락", "HIGH", false, "터미널 방문자 추적 배너가 동의 전 수집을 시작함"),
                new ComplianceItem("GDPR-ERASURE-01", "GDPR", "잊힐 권리 처리 경로 부재", "HIGH", false, "컨테이너 작업 로그가 불변 저장소에 직접 결합됨"),
                new ComplianceItem("HIPAA-RBAC-01", "HIPAA", "근로자 의료 데이터 접근 제어 미흡", "CRITICAL", false, "야드 운영자 권한으로 의료 컨테이너 메모 조회 가능"),
                new ComplianceItem("PCI-LOG-01", "PCI-DSS", "결제 카드 정보 로그 평문 기록", "CRITICAL", false, "정산 이벤트가 카드번호 마스킹 없이 보안 로그에 기록됨"),
                new ComplianceItem("A11Y-UI-01", "WCAG", "스크린 리더 및 대비 위반", "MEDIUM", false, "위험 배지가 색상에만 의존하고 일부 보조 텍스트가 없음")
        );
    }
}

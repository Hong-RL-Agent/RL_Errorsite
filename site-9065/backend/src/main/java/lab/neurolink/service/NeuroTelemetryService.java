package lab.neurolink.service;

import lab.neurolink.model.DefectScenario;
import lab.neurolink.model.EegChannel;
import lab.neurolink.model.HardwareStatus;
import lab.neurolink.model.LogEntry;
import lab.neurolink.model.NeuroSnapshot;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Service
public class NeuroTelemetryService {
    private static final String[] BANDS = {"delta", "theta", "alpha", "beta", "gamma"};
    private final Random random = new Random();

    public NeuroSnapshot snapshot() {
        long tick = System.currentTimeMillis() / 1000;
        return new NeuroSnapshot(
                Instant.now(),
                "NLINK-9065-" + Long.toHexString(tick).toUpperCase(Locale.ROOT),
                rounded(62 + wave(tick, 17) * 16 + random.nextDouble() * 4),
                rounded(0.22 + Math.abs(wave(tick, 11)) * 0.51),
                eegChannels(tick),
                heatmap(tick),
                hardware(tick),
                scenarios(),
                logs(tick)
        );
    }

    public List<DefectScenario> scenarios() {
        return List.of(
                scenario(1, "읽기전용 파일 시스템으로 인한 업데이트 쓰기 실패", "Updater FS", "critical", "EROFS", "OTA staging write denied on /opt/neuro-link/releases", "mount state preflight and writable overlay fallback", 0.96),
                scenario(2, "mmap 파일 구조 변경에 따른 메모리 참조 크래시", "Shared Memory", "critical", "SIGBUS", "reader expects v2 frame stride while producer emits v3 header", "schema-tagged mmap segments and rolling compatibility reader", 0.94),
                scenario(3, "업데이트 바이너리의 실행 권한(+x) 누락", "Installer", "high", "EACCES", "post-update launcher cannot execute neuro-agent.bin", "artifact permission verification before symlink promotion", 0.91),
                scenario(4, "NPU 런타임 라이브러리 버전 불일치 및 연산 지연", "NPU Runtime", "high", "ABI_DRIFT", "libnpu_rt 5.2 loads model compiled for 5.4 kernels", "runtime ABI lockfile and latency canary", 0.89),
                scenario(5, "업데이트 직후 첫 실행 시 JIT 컴파일 병목 현상", "JIT Cache", "medium", "COLD_START", "first inference blocks on graph specialization", "warmup graph compile during maintenance window", 0.86),
                scenario(6, "설정 파일 하위 호환성 문제로 인한 무한 롤백 루프", "Config", "critical", "ROLLBACK_LOOP", "legacy device rejects new calibration config and reverts repeatedly", "config migration guard with monotonic rollback counter", 0.97),
                scenario(7, "설치 패키지의 압축 알고리즘 버전 미지원 오류", "Package", "medium", "ZSTD_UNSUPPORTED", "edge installer lacks dictionary support for package stream", "negotiate compression capability before download", 0.84),
                scenario(8, "심볼릭 링크 교체 시 발생하는 레이스 컨디션", "Release Switch", "high", "ENOENT_RACE", "service resolves current link during non-atomic replacement", "atomic rename and file descriptor pinning", 0.9),
                scenario(9, "HAL 드라이버와 커널 버전 정합성 결여", "HAL Driver", "critical", "KABI_MISMATCH", "eeg-hal.ko built for 6.6 headers on 6.1 runtime kernel", "kernel/HAL compatibility matrix gate", 0.95),
                scenario(10, "저사양 기기용 AI 모델 경량화 패치 적용 실패", "Model Patch", "high", "QUANT_PATCH_FAIL", "int8 delta patch cannot map missing base tensor", "base model checksum and fallback model tier", 0.88),
                scenario(11, "OS 보안 시스템(평판 기반)에 의한 실행 차단", "OS Security", "high", "REPUTATION_BLOCK", "new binary quarantined before trust score propagation", "signed release notarization and staged reputation warmup", 0.87)
        );
    }

    private List<EegChannel> eegChannels(long tick) {
        List<EegChannel> channels = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            List<Double> points = new ArrayList<>();
            for (int p = 0; p < 96; p++) {
                double fast = Math.sin((p + tick * 2 + i * 7) / (4.0 + i * 0.18));
                double slow = Math.cos((p + tick + i * 3) / 13.0);
                points.add(rounded((fast * 34) + (slow * 12) + random.nextGaussian() * 3));
            }
            double microvolts = points.stream().mapToDouble(Math::abs).average().orElse(0);
            channels.add(new EegChannel(
                    "CH-" + (i + 1),
                    List.of("Fp1", "Fp2", "C3", "C4", "P3", "P4", "O1", "O2").get(i),
                    BANDS[i % BANDS.length],
                    rounded(4.2 + random.nextDouble() * 2.4),
                    rounded(microvolts),
                    points
            ));
        }
        return channels;
    }

    private double[][] heatmap(long tick) {
        double[][] grid = new double[7][9];
        for (int y = 0; y < grid.length; y++) {
            for (int x = 0; x < grid[y].length; x++) {
                double centerBias = 1.0 - (Math.abs(x - 4) + Math.abs(y - 3)) / 10.0;
                grid[y][x] = rounded(Math.max(0, centerBias + wave(tick + x * 3L + y * 5L, 9) * 0.35));
            }
        }
        return grid;
    }

    private List<HardwareStatus> hardware(long tick) {
        return List.of(
                new HardwareStatus("NPU Runtime", "degraded", "5.2.1 / expected 5.4.x", rounded(28 + Math.abs(wave(tick, 7)) * 52), 78.4, "ABI drift detected; inference queue throttled"),
                new HardwareStatus("EEG HAL", "mismatch", "hal-2.8.0 / kernel 6.1", rounded(9 + random.nextDouble() * 5), 42.8, "Kernel compatibility gate failed"),
                new HardwareStatus("mmap Bus", "unstable", "schema v3", rounded(4 + random.nextDouble() * 8), 61.2, "Segment stride changed while reader remains pinned"),
                new HardwareStatus("Update Agent", "blocked", "2026.05.04-rc2", rounded(15 + random.nextDouble() * 10), 54.6, "Write and execution permission preflight failed")
        );
    }

    private List<LogEntry> logs(long tick) {
        return List.of(
                new LogEntry(Instant.now().minusSeconds(6).toString(), "ERROR", "updater.fs", "EROFS while writing release manifest to /opt/neuro-link/releases/current"),
                new LogEntry(Instant.now().minusSeconds(5).toString(), "WARN", "npu.runtime", "libnpu_rt ABI 5.2.1 does not match compiled graph ABI 5.4.0"),
                new LogEntry(Instant.now().minusSeconds(4).toString(), "ERROR", "hal.loader", "Kernel module eeg-hal.ko rejected by vermagic check"),
                new LogEntry(Instant.now().minusSeconds(3).toString(), "WARN", "jit.cache", "Cold graph specialization exceeded " + Math.round(420 + Math.abs(wave(tick, 4)) * 160) + "ms"),
                new LogEntry(Instant.now().minusSeconds(2).toString(), "INFO", "regression", "11 deployment anti-pattern probes loaded for PPO agent training")
        );
    }

    private DefectScenario scenario(int id, String title, String subsystem, String severity, String signal, String failureMode, String mitigation, double confidence) {
        return new DefectScenario(id, title, subsystem, severity, signal, failureMode, mitigation, confidence);
    }

    private double wave(long tick, int width) {
        return Math.sin(tick / (double) width);
    }

    private double rounded(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}


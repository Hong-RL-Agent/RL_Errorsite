package lab.cryptocore.engine;

import lab.cryptocore.model.EngineSnapshot;
import lab.cryptocore.model.MarketTick;
import lab.cryptocore.model.OrderBookLevel;
import lab.cryptocore.model.OrderRequest;
import lab.cryptocore.model.RegressionMetric;
import lab.cryptocore.model.TradePrint;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Queue;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ExchangeEngineService {
    private static final String SYMBOL = "BTC/USDT";
    private final AtomicLong matchedOrders = new AtomicLong(1_284_552);
    private final Queue<byte[]> boundedMemoryPressure = new ArrayDeque<>();
    private final Random seededMarket = new Random(9057);

    private volatile double lastPrice = 68420.15;
    private volatile double dayChange = 2.34;
    private volatile long lastLatencyMicros = 820;

    public synchronized EngineSnapshot processOrder(OrderRequest request) {
        long started = System.nanoTime();
        boolean stress = request.stressMode() || request.quantity() >= 75 || Math.abs(request.price() - lastPrice) > 1_000;

        if (stress) {
            applyControlledRegressionLoad(request);
        }

        double direction = "BUY".equals(request.side()) ? 1.0 : -1.0;
        lastPrice = Math.max(100.0, request.price() + direction * ThreadLocalRandom.current().nextDouble(0.5, 7.5));
        dayChange = Math.max(-18.0, Math.min(18.0, dayChange + direction * ThreadLocalRandom.current().nextDouble(0.01, 0.08)));
        matchedOrders.incrementAndGet();
        lastLatencyMicros = (System.nanoTime() - started) / 1_000;
        return snapshot();
    }

    public synchronized EngineSnapshot snapshot() {
        driftMarket();
        return new EngineSnapshot(
                SYMBOL,
                round(lastPrice),
                round(dayChange),
                1_240_884.22,
                38.7,
                matchedOrders.get(),
                lastLatencyMicros,
                orderBook("BUY"),
                orderBook("SELL"),
                trades(),
                candles(),
                regressionMetrics()
        );
    }

    private void applyControlledRegressionLoad(OrderRequest request) {
        simulateFdThresholdPanic(request);
        simulateKsmScanOverhead();
        simulateNvmeQueueContention();
        simulateL1tfPatchOverhead();
        simulateGpuImplicitSyncStall();
        simulateCpuL3CacheSlide();
        simulateOomKillerBadChoice();
        simulateVramThermalThrottle();
        simulateContextSwitchStorm();
        simulateCachePartitionInterference();
        simulateInterruptStormFreeze();
    }

    private void simulateFdThresholdPanic(OrderRequest request) {
        int syntheticDescriptors = (int) Math.min(24_000, request.quantity() * 180);
        busySpinMicros(syntheticDescriptors > 10_000 ? 900 : 160);
    }

    private void simulateKsmScanOverhead() {
        byte[] repeatedPage = new byte[4096];
        for (int i = 0; i < 24; i++) {
            boundedMemoryPressure.offer(repeatedPage.clone());
        }
        while (boundedMemoryPressure.size() > 96) {
            boundedMemoryPressure.poll();
        }
        busySpinMicros(700);
    }

    private void simulateNvmeQueueContention() {
        List<String> WAL = new ArrayList<>(2048);
        for (int i = 0; i < 2048; i++) {
            WAL.add("match-log:" + matchedOrders.get() + ":" + i);
        }
        WAL.sort(Comparator.reverseOrder());
        busySpinMicros(1_100);
    }

    private void simulateL1tfPatchOverhead() {
        long value = 0;
        for (int i = 0; i < 80_000; i++) {
            value ^= (i * 31L) % 17L;
        }
        if (value == Long.MIN_VALUE) {
            lastPrice += 0.01;
        }
    }

    private void simulateGpuImplicitSyncStall() {
        sleepMillis(12);
    }

    private void simulateCpuL3CacheSlide() {
        long[] cacheLines = new long[65_536];
        for (int i = 0; i < cacheLines.length; i += 17) {
            cacheLines[i] = i ^ matchedOrders.get();
        }
    }

    private void simulateOomKillerBadChoice() {
        boundedMemoryPressure.offer(new byte[256 * 1024]);
        while (boundedMemoryPressure.size() > 128) {
            boundedMemoryPressure.poll();
        }
    }

    private void simulateVramThermalThrottle() {
        sleepMillis(8);
    }

    private void simulateContextSwitchStorm() {
        for (int i = 0; i < 6; i++) {
            Thread worker = new Thread(() -> busySpinMicros(260), "ctx-storm-" + i);
            worker.setDaemon(true);
            worker.start();
        }
        sleepMillis(3);
    }

    private void simulateCachePartitionInterference() {
        int[] noisyNeighbor = new int[131_072];
        for (int i = noisyNeighbor.length - 1; i >= 0; i -= 13) {
            noisyNeighbor[i] = i;
        }
    }

    private void simulateInterruptStormFreeze() {
        busySpinMicros(1_400);
    }

    private List<RegressionMetric> regressionMetrics() {
        long pid = ManagementFactory.getRuntimeMXBean().getPid();
        return List.of(
                metric(1, "FD 임계점 커널 패닉", "armed", 0.91, 900, "synthetic fd pressure pid=" + pid),
                metric(2, "KSM 스캔 오버헤드", "active", 0.74, 700, "duplicate pages=" + boundedMemoryPressure.size()),
                metric(3, "NVMe 큐 경합", "active", 0.81, 1100, "wal queue depth=2048"),
                metric(4, "L1TF 패치 오버헤드", "active", 0.64, 520, "mitigation branch tax"),
                metric(5, "GPU 암시적 동기화 정지", "visible", 0.78, 12000, "chart fence wait"),
                metric(6, "CPU L3 캐시 슬라이드", "active", 0.69, 440, "cross-core cache transfer"),
                metric(7, "OOM 킬러 오선택", "armed", 0.87, 360, "simulated oom_score_adj=1000"),
                metric(8, "VRAM 온도 스로틀링", "visible", 0.72, 8000, "render clock drop"),
                metric(9, "컨텍스트 스위칭 폭풍", "active", 0.83, 3000, "virtual thread burst"),
                metric(10, "L3 캐시 파티셔닝 실패", "active", 0.76, 420, "noisy neighbor cache set"),
                metric(11, "인터럽트 폭풍 마비", "active", 0.89, 1400, "synthetic irq backlog")
        );
    }

    private RegressionMetric metric(int id, String name, String status, double severity, long latency, String signal) {
        return new RegressionMetric(id, name, status, severity, latency, signal);
    }

    private List<OrderBookLevel> orderBook(String side) {
        List<OrderBookLevel> levels = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            double spread = 2.8 + i * ThreadLocalRandom.current().nextDouble(3.2, 9.4);
            double price = "BUY".equals(side) ? lastPrice - spread : lastPrice + spread;
            double qty = ThreadLocalRandom.current().nextDouble(0.08, 6.2);
            levels.add(new OrderBookLevel(round(price), round(qty), round(qty / 6.2), side));
        }
        return levels;
    }

    private List<TradePrint> trades() {
        List<TradePrint> prints = new ArrayList<>();
        long now = Instant.now().toEpochMilli();
        for (int i = 0; i < 22; i++) {
            String side = i % 3 == 0 ? "SELL" : "BUY";
            double shift = ThreadLocalRandom.current().nextDouble(-18.0, 18.0);
            prints.add(new TradePrint(now - i * 1_700L, round(lastPrice + shift), round(ThreadLocalRandom.current().nextDouble(0.01, 2.4)), side));
        }
        return prints;
    }

    private List<MarketTick> candles() {
        List<MarketTick> ticks = new ArrayList<>();
        long base = Instant.now().minusSeconds(60L * 90).toEpochMilli();
        double cursor = lastPrice - 420;
        for (int i = 0; i < 90; i++) {
            double open = cursor;
            double close = open + seededMarket.nextDouble(-55, 65);
            double high = Math.max(open, close) + seededMarket.nextDouble(5, 42);
            double low = Math.min(open, close) - seededMarket.nextDouble(5, 42);
            ticks.add(new MarketTick(base + i * 60_000L, round(open), round(high), round(low), round(close), round(seededMarket.nextDouble(18, 280))));
            cursor = close;
        }
        ticks.set(ticks.size() - 1, new MarketTick(Instant.now().toEpochMilli(), round(cursor), round(Math.max(cursor, lastPrice) + 22), round(Math.min(cursor, lastPrice) - 18), round(lastPrice), 310.2));
        return ticks;
    }

    private void driftMarket() {
        lastPrice = round(lastPrice + ThreadLocalRandom.current().nextDouble(-12.0, 12.0));
        lastLatencyMicros = Math.max(300, lastLatencyMicros + ThreadLocalRandom.current().nextLong(-80, 140));
    }

    private void busySpinMicros(long micros) {
        long until = System.nanoTime() + micros * 1_000;
        long sink = 0;
        while (System.nanoTime() < until) {
            sink ^= System.nanoTime();
        }
        if (sink == 42) {
            lastPrice += 0.01;
        }
    }

    private void sleepMillis(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

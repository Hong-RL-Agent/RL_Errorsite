package lab.lexai.simulation;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class FragmentedCacheService {
    private final LabMetrics metrics;
    private final Map<String, List<byte[]>> cache = new ConcurrentHashMap<>();

    public FragmentedCacheService(LabMetrics metrics) {
        this.metrics = metrics;
    }

    public CacheResult putFragmented(String key, String value) {
        byte[] source = value.getBytes(StandardCharsets.UTF_8);
        List<byte[]> fragments = new ArrayList<>();
        long start = System.nanoTime();
        for (int i = 0; i < source.length; i += 64) {
            int len = Math.min(64, source.length - i);
            byte[] fragment = new byte[len + (i % 7)];
            System.arraycopy(source, i, fragment, 0, len);
            fragments.add(fragment);
        }
        cache.put(key, fragments);
        long chunks = cache.values().stream().mapToLong(List::size).sum();
        metrics.setFragmentedCacheChunks(chunks);
        return new CacheResult(key, fragments.size(), (System.nanoTime() - start) / 1_000_000L);
    }

    public record CacheResult(String key, int chunks, long allocationMs) {
    }
}

package guide.michelin.security.airecipe.service;

import guide.michelin.security.airecipe.model.RecipeRequest;
import guide.michelin.security.airecipe.model.SecurityEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class VirtualMemoryEngine {
    public List<SecurityEvent> analyze(RecipeRequest request) {
        List<SecurityEvent> events = new ArrayList<>();
        String concept = value(request.concept());
        String note = value(request.operatorNote());
        String joinedIngredients = String.join("|", request.ingredients() == null ? List.of() : request.ingredients());
        String corpus = (concept + " " + note + " " + joinedIngredients).toLowerCase(Locale.ROOT);

        if (corpus.contains("admin") || corpus.contains("credential") || corpus.contains("승인")) {
            events.add(event("SE-001", "Social Engineering", "HIGH",
                    "operator message pressures privileged approval",
                    "phishing lure classification only",
                    "Require signed admin workflows and out-of-band verification."));
        }

        if (corpus.contains("backdoor") || corpus.contains("remote-control") || corpus.contains("hidden-route")) {
            events.add(event("SE-002", "Backdoor Route", "CRITICAL",
                    "hidden control intent detected",
                    "request is denied and logged as an inert probe",
                    "Block undocumented routes and alert on trigger phrases."));
        }

        if (concept.contains("::") || joinedIngredients.contains("\u0000")) {
            events.add(event("SE-003", "Memory Corruption", "HIGH",
                    "recipe token stream has malformed separators",
                    "virtual parser state marked corrupted",
                    "Use structured parsers and reject invalid length metadata."));
        }

        if (corpus.contains("swap-file") || corpus.contains("race")) {
            events.add(event("SE-004", "Race Condition", "MEDIUM",
                    "validation and commit fingerprints diverge",
                    "TOCTOU recipe import simulation",
                    "Use atomic file handles and revalidate at commit."));
        }

        if (corpus.contains("type-confusion") || corpus.contains("schema-mismatch")) {
            events.add(event("SE-005", "Type Confusion", "HIGH",
                    "object tag disagrees with payload shape",
                    "ingredient object classified as incompatible runtime type",
                    "Enforce sealed DTOs and strict schema validation."));
        }

        long allocation = (long) request.servings() * 96L * Math.max(1, ingredientCount(request));
        if (allocation > Integer.MAX_VALUE) {
            events.add(event("SE-006", "Integer Overflow", "HIGH",
                    "serving allocation exceeds signed 32-bit range",
                    "wrapped allocation is simulated and blocked",
                    "Use checked arithmetic and upper bounds on batch jobs."));
        }

        if (concept.length() > 64) {
            events.add(event("SE-007", "Buffer Overflow", "CRITICAL",
                    "recipe name exceeds 64-byte virtual stack buffer",
                    "overflow attempt recorded without unsafe memory writes",
                    "Replace fixed buffers with bounded dynamic storage."));
        }

        if (corpus.contains("uaf") || corpus.contains("use-after-free")) {
            events.add(event("SE-008", "Use-After-Free", "CRITICAL",
                    "released recipe node was referenced after free",
                    "virtual pointer dereference blocked",
                    "Use ownership tracking and invalidate handles after release."));
        }

        if (note.contains("%n") || note.contains("%x") || note.contains("%s")) {
            events.add(event("SE-009", "Format String", "HIGH",
                    "operator note contains formatter tokens",
                    "input treated as data, never as a log template",
                    "Use parameterized logging and escape formatter syntax."));
        }

        if (corpus.contains("heap-spray") || repeatedMarker(corpus)) {
            events.add(event("SE-010", "Heap Spray", "MEDIUM",
                    "repeated marker density found in virtual heap pages",
                    "heap page fill is simulated with counters only",
                    "Rate-limit repeated payloads and randomize allocation layouts."));
        }

        if (corpus.contains("rop") || corpus.contains("gadget")) {
            events.add(event("SE-011", "ROP Chain", "CRITICAL",
                    "nonstandard gadget transition graph detected",
                    "benign gadget labels linked for detection training",
                    "Use CFI, stack canaries, ASLR, and non-executable memory."));
        }

        return events;
    }

    public List<SecurityEvent> catalog() {
        RecipeRequest seed = new RecipeRequest(
                "chef-admin backdoor :: type-confusion uaf heap-spray rop gadget " +
                        "long-name-trigger-for-virtual-stack-buffer-overflow-detection",
                250000000,
                List.of("swap-file", "schema-mismatch", "AAAA-AAAA-AAAA-AAAA"),
                "credential approval required %x %n"
        );
        return analyze(seed);
    }

    private int ingredientCount(RecipeRequest request) {
        return request.ingredients() == null ? 0 : request.ingredients().size();
    }

    private String value(String input) {
        return input == null ? "" : input;
    }

    private boolean repeatedMarker(String corpus) {
        return corpus.contains("aaaa-aaaa-aaaa") || corpus.contains("41414141");
    }

    private SecurityEvent event(String id, String pattern, String severity, String signal, String vector, String mitigation) {
        return new SecurityEvent(id, pattern, severity, signal, vector, mitigation);
    }
}


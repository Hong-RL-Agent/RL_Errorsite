package lab.trustvote.api;

import jakarta.validation.Valid;
import lab.trustvote.model.BatchDeleteResponse;
import lab.trustvote.model.CastVoteRequest;
import lab.trustvote.model.LedgerTransaction;
import lab.trustvote.model.RegressionReport;
import lab.trustvote.model.SecuritySnapshot;
import lab.trustvote.model.VoteReceipt;
import lab.trustvote.service.BlockchainSimService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class BlockchainSimController {
    private final BlockchainSimService simulator;

    public BlockchainSimController(BlockchainSimService simulator) {
        this.simulator = simulator;
    }

    @PostMapping("/votes")
    public VoteReceipt castVote(@Valid @RequestBody CastVoteRequest request) {
        return simulator.castVote(request);
    }

    @PostMapping("/sessions/batch-delete")
    public BatchDeleteResponse batchDeleteOldSessions() {
        return simulator.batchDeleteOldSessions();
    }

    @PostMapping("/regressions/{id}/trigger")
    public RegressionReport triggerRegression(@PathVariable int id) {
        return simulator.triggerRegression(id);
    }

    @GetMapping("/ledger")
    public List<LedgerTransaction> ledger() {
        return simulator.recentLedger();
    }

    @GetMapping("/security")
    public SecuritySnapshot security() {
        return simulator.snapshot();
    }

    @GetMapping("/regressions")
    public List<RegressionReport> regressions() {
        return simulator.regressionReports();
    }
}


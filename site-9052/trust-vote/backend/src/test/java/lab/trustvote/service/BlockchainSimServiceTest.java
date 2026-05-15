package lab.trustvote.service;

import lab.trustvote.model.CastVoteRequest;
import lab.trustvote.model.VoteReceipt;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BlockchainSimServiceTest {
    @Test
    void castVoteAppliesRegressionPenaltiesAndAppendsLedger() {
        BlockchainSimService service = new BlockchainSimService(0, 1, 40);

        VoteReceipt receipt = service.castVote(new CastVoteRequest("P-17", "Ahn", "remote"));

        assertThat(receipt.accepted()).isTrue();
        assertThat(receipt.regressionsApplied()).anyMatch(item -> item.contains("TLB shootdown"));
        assertThat(service.recentLedger()).anyMatch(tx -> tx.id().equals(receipt.receiptId()));
        assertThat(service.snapshot().tally().get("Ahn")).isGreaterThan(428);
    }
}


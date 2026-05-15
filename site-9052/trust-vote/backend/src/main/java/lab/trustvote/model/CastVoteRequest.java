package lab.trustvote.model;

import jakarta.validation.constraints.NotBlank;

public record CastVoteRequest(
        @NotBlank String precinct,
        @NotBlank String candidate,
        String numaNode
) {
}


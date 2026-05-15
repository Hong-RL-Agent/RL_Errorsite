package lab.cryptocore.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OrderRequest(
        @NotBlank String symbol,
        @Pattern(regexp = "BUY|SELL") String side,
        @DecimalMin("0.0001") double quantity,
        @DecimalMin("0.01") double price,
        boolean stressMode
) {
}


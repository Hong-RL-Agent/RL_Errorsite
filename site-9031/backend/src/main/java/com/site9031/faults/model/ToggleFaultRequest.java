package com.site9031.faults.model;

import jakarta.validation.constraints.NotNull;

public record ToggleFaultRequest(@NotNull Boolean enabled) {
}

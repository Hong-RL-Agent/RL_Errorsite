package com.fuzzing.agent.dto;

import java.math.BigDecimal;

public record UserDTO(
    Long id,
    String username,
    String email,
    String nickname
) {}

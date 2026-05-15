package com.aitherapy.model;

import java.time.LocalDate;

public record SessionNote(String id, LocalDate date, String mood, String summary, int riskScore) {
}

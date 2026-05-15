package com.aitherapy.model;

public record SecurityFinding(String id, String name, String severity, String endpoint, String status) {
}

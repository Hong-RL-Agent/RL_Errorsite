package com.smartport.model;

public record ComplianceItem(
        String id,
        String regulation,
        String title,
        String severity,
        boolean compliant,
        String evidence) {
}

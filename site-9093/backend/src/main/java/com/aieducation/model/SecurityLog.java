package com.aieducation.model;

public record SecurityLog(String level, String source, String message, String timestamp) {
}

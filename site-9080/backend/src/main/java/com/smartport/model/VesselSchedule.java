package com.smartport.model;

public record VesselSchedule(
        String vessel,
        String imo,
        String berth,
        String operation,
        String eta,
        String etd,
        int teu,
        String status) {
}

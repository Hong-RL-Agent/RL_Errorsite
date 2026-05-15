package com.smarthomesec.api.model;

public record DeviceStatus(
        String id,
        String name,
        String type,
        String room,
        String status,
        int battery,
        boolean locked,
        double signal
) {
}

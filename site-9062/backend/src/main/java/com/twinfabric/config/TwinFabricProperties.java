package com.twinfabric.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "twin")
public record TwinFabricProperties(
        String nodeId,
        String region,
        String peerEndpoint
) {
}


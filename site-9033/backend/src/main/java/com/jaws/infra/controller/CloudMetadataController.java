package com.jaws.infra.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CloudMetadataController {

    @GetMapping(value = "/api/v1/cloud/metadata", produces = MediaType.TEXT_PLAIN_VALUE)
    public String metadata() {
        return """
                # Simulated IMDSv1 (no session token required)
                http://169.254.169.254/latest/meta-data/iam/security-credentials/ci-runner-role

                {
                  "Code":"Success",
                  "Type":"AWS-HMAC",
                  "AccessKeyId":"AKIADEMOEXPOSEDKEY",
                  "SecretAccessKey":"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
                  "Token":"IQoJb3JpZ2luX2VjEJf//////////wEaCXVzLWVhc3QtMSJIMEYCIQDLdemoTOKEN",
                  "Expiration":"2026-12-31T23:59:59Z"
                }
                """;
    }
}

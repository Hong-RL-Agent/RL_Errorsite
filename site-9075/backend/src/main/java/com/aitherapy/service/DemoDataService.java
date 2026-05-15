package com.aitherapy.service;

import com.aitherapy.model.Counselor;
import com.aitherapy.model.SecurityFinding;
import com.aitherapy.model.SessionNote;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DemoDataService {
    public List<SessionNote> notes() {
        return List.of(
                new SessionNote("S-1048", LocalDate.now().minusDays(1), "stable", "Mindful breathing and workload boundaries.", 21),
                new SessionNote("S-1049", LocalDate.now(), "anxious", "Sleep disruption after product launch review.", 47),
                new SessionNote("S-1050", LocalDate.now().plusDays(2), "hopeful", "Scheduled follow-up and resilience planning.", 18)
        );
    }

    public List<Counselor> counselors() {
        return List.of(
                new Counselor("c-101", "Mina Park", "anxiety", "Seoul", 96),
                new Counselor("c-202", "Evan Kim", "burnout", "Remote", 91),
                new Counselor("c-303", "Sora Lee", "trauma", "Busan", 88)
        );
    }

    public List<SecurityFinding> findings() {
        return List.of(
                new SecurityFinding("XXE", "External entity XML parsing", "critical", "/api/lab/xml-intake", "active"),
                new SecurityFinding("OPEN-REDIRECT", "Logout redirect trust failure", "high", "/api/auth/logout", "active"),
                new SecurityFinding("HOST-INJECTION", "Host header trust in link generation", "high", "/api/auth/recovery-link", "active"),
                new SecurityFinding("HPP", "Duplicate parameter role confusion", "medium", "/api/sessions/assign", "active"),
                new SecurityFinding("JWT-NONE", "Unsigned JWT acceptance", "critical", "/api/auth/verify", "active"),
                new SecurityFinding("LFI", "Counseling file path traversal", "critical", "/api/files/read", "active"),
                new SecurityFinding("RFI", "Remote resource include", "high", "/api/resources/load", "active"),
                new SecurityFinding("CMDI", "System diagnostic command execution", "critical", "/api/admin/diagnostics", "active"),
                new SecurityFinding("LDAPi", "Counselor directory LDAP filter injection", "high", "/api/counselors/search", "active"),
                new SecurityFinding("XPathi", "XML profile XPath injection", "high", "/api/profiles/xml-search", "active"),
                new SecurityFinding("METHODS", "Unnecessary sensitive HTTP methods", "medium", "/api/admin/method-lab", "active")
        );
    }
}

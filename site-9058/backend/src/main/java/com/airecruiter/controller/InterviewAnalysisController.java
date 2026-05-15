package com.airecruiter.controller;

import com.airecruiter.model.AnalysisRequest;
import com.airecruiter.model.AnalysisResult;
import com.airecruiter.model.InterviewSummary;
import com.airecruiter.service.InterviewAnalysisService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InterviewAnalysisController {

    private final InterviewAnalysisService interviewAnalysisService;

    public InterviewAnalysisController(InterviewAnalysisService interviewAnalysisService) {
        this.interviewAnalysisService = interviewAnalysisService;
    }

    @GetMapping("/interviews")
    public List<InterviewSummary> interviews() {
        return interviewAnalysisService.getInterviews();
    }

    @GetMapping("/analysis/live")
    public AnalysisResult liveAnalysis() {
        return interviewAnalysisService.createLiveSnapshot();
    }

    @PostMapping("/analysis/run")
    public AnalysisResult runAnalysis(@Valid @RequestBody AnalysisRequest request) {
        return interviewAnalysisService.analyze(request);
    }
}

package ai.trans.policylab.model;

public record TranslationRequest(String sourceLanguage, String targetLanguage, String text) {
}


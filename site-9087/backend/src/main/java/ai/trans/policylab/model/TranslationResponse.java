package ai.trans.policylab.model;

public record TranslationResponse(String sourceLanguage, String targetLanguage, String translatedText, double confidence) {
}


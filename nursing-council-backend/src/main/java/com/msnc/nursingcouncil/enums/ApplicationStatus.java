package com.msnc.nursingcouncil.enums;

public enum ApplicationStatus {
    SUBMITTED,
    DOCUMENTS_VERIFIED,
    COUNCIL_REVIEW,
    CERTIFICATE_GENERATION,
    COMPLETED,
    REJECTED;

    public String getDisplayLabel() {
        return switch (this) {
            case SUBMITTED              -> "Application submitted";
            case DOCUMENTS_VERIFIED     -> "Documents verified";
            case COUNCIL_REVIEW         -> "Council review";
            case CERTIFICATE_GENERATION -> "Certificate generation";
            case COMPLETED              -> "Dispatch via email / SMS";
            case REJECTED               -> "Application rejected";
        };
    }
}

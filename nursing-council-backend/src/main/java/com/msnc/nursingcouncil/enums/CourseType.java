package com.msnc.nursingcouncil.enums;

public enum CourseType {
    GNM,
    BSC_NURSING,
    POST_BASIC_BSC,
    MSC_NURSING,
    ANM;

    public String getDisplayName() {
        return switch (this) {
            case GNM           -> "GNM (General Nursing & Midwifery)";
            case BSC_NURSING   -> "B.Sc Nursing";
            case POST_BASIC_BSC-> "Post Basic B.Sc Nursing";
            case MSC_NURSING   -> "M.Sc Nursing";
            case ANM           -> "ANM (Auxiliary Nurse Midwifery)";
        };
    }
}

package com.msnc.nursingcouncil.util;

import com.msnc.nursingcouncil.enums.ApplicationType;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Generates human-readable reference numbers.
 * Format:
 *   New Registration : MSNC-2026-XXXXX
 *   Renewal          : MSNC-RNW-2026-XXXXX
 */
@Component
public class ReferenceNumberGenerator {

    public String generate(ApplicationType type) {
        int year   = Year.now().getValue();
        int suffix = ThreadLocalRandom.current().nextInt(10_000, 99_999);

        return switch (type) {
            case NEW_REGISTRATION -> String.format("MSNC-%d-%05d", year, suffix);
            case RENEWAL          -> String.format("MSNC-RNW-%d-%05d", year, suffix);
        };
    }
}

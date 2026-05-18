package com.msnc.nursingcouncil.config;

import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.enums.UserRole;
import com.msnc.nursingcouncil.repository.CouncilUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the default SUPERUSER account on first startup.
 * Credentials are read from application.properties (overridable via env vars).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CouncilUserRepository userRepository;
    private final PasswordEncoder       passwordEncoder;

    @Value("${app.superuser.username}")
    private String superUsername;

    @Value("${app.superuser.password}")
    private String superPassword;

    @Value("${app.superuser.email}")
    private String superEmail;

    @Value("${app.superuser.fullname}")
    private String superFullName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername(superUsername)) {
            log.info("Superuser '{}' already exists — skipping seed.", superUsername);
            return;
        }

        CouncilUser superuser = CouncilUser.builder()
                .username(superUsername)
                .fullName(superFullName)
                .email(superEmail)
                .passwordHash(passwordEncoder.encode(superPassword))
                .role(UserRole.SUPERUSER)
                .active(true)
                .build();

        userRepository.save(superuser);
        log.info("Superuser '{}' created successfully.", superUsername);
    }
}

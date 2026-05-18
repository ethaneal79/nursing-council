package com.msnc.nursingcouncil.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // =========================
                // PUBLIC ENDPOINTS
                // =========================

                .requestMatchers(HttpMethod.POST,
                        "/registration",
                        "/registration/**"
                ).permitAll()

                .requestMatchers(HttpMethod.POST,
                        "/renewal",
                        "/renewal/**"
                ).permitAll()

                .requestMatchers(HttpMethod.GET,
                        "/renewal/verify"
                ).permitAll()

                .requestMatchers(HttpMethod.POST,
                        "/verify"
                ).permitAll()

                .requestMatchers(HttpMethod.POST,
                        "/status/track"
                ).permitAll()

                .requestMatchers(HttpMethod.GET,
                        "/notices/**"
                ).permitAll()

                // Certificate public access
                .requestMatchers(
                        "/certificates/**"
                ).permitAll()

                // =========================
                // AUTH
                // =========================

                .requestMatchers(HttpMethod.POST,
                        "/auth/login"
                ).permitAll()

                // =========================
                // ROLE BASED ACCESS
                // =========================

                // Superuser only
                .requestMatchers(
                        "/admin/**"
                ).hasRole("SUPERUSER")

                // Registrar + Superuser
                .requestMatchers(
                        "/registrar/**"
                ).hasAnyRole("SUPERUSER", "REGISTRAR")

                // DA + Registrar + Superuser
                .requestMatchers(
                        "/da/**"
                ).hasAnyRole(
                        "SUPERUSER",
                        "REGISTRAR",
                        "DEALING_ASSISTANT"
                )

                // Everything else secured
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "https://msnc.gov.in"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
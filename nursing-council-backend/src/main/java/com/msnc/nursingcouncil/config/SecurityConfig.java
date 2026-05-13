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
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
<<<<<<< HEAD
            	    .requestMatchers(HttpMethod.POST, "/registration", "/api/registration/*/documents").permitAll()
            	    .requestMatchers(HttpMethod.POST, "/renewal", "/api/renewal/*/documents").permitAll()
            	    .requestMatchers(HttpMethod.GET,  "/renewal/verify").permitAll()
            	    .requestMatchers(HttpMethod.POST, "/verify").permitAll()
            	    .requestMatchers(HttpMethod.POST, "/status/track").permitAll()
            	    .requestMatchers(HttpMethod.GET,  "/notices/**").permitAll()

            	    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()

            	    .requestMatchers("/admin/**").hasRole("SUPERUSER")
            	    .requestMatchers("/registrar/**").hasRole("REGISTRAR")
            	    .requestMatchers("/da/**").hasRole("DEALING_ASSISTANT")

            	    .anyRequest().authenticated()
            	)
=======
                // Public endpoints (applicant-facing)
                .requestMatchers(HttpMethod.POST, "/registration", "/registration/*/documents").permitAll()
                .requestMatchers(HttpMethod.POST, "/renewal", "/renewal/*/documents").permitAll()
                .requestMatchers(HttpMethod.GET,  "/renewal/verify").permitAll()
                .requestMatchers(HttpMethod.POST, "/verify").permitAll()
                .requestMatchers(HttpMethod.POST, "/status/track").permitAll()
                .requestMatchers(HttpMethod.GET,  "/notices/**").permitAll()
                // Auth
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                // Admin only
                .requestMatchers("/admin/**").hasRole("SUPERUSER")
                // Registrar + Admin
                .requestMatchers("/registrar/**").hasAnyRole("SUPERUSER", "REGISTRAR")
                // Dealing Assistant + above
                .requestMatchers("/da/**").hasAnyRole("SUPERUSER", "REGISTRAR", "DEALING_ASSISTANT")
                .anyRequest().authenticated()
            )
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
<<<<<<< HEAD
        config.setAllowedOrigins(List.of(
        	    "http://localhost:3000",
        	    "http://127.0.0.1:3000",
        	    "https://msnc.gov.in"
        	));
=======
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://msnc.gov.in"));
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
package com.music_library.admin_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration class for the Admin Service.
 * Configures Spring Security settings including authentication, authorization,
 * and password encoding.
 * 
 * Configuration includes:
 * - Disabling CSRF protection (for REST API)
 * - Permitting all requests without authentication (simplified for demo)
 * - BCrypt password encoder for password hashing
 * 
 * Note: In a production environment, this should be enhanced with:
 * - Role-based access control
 * - JWT token validation
 * - Specific endpoint protection
 * - CSRF protection for non-API endpoints
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Configuration
public class SecurityConfig {

    /**
     * Configures the password encoder for hashing passwords.
     * Uses BCrypt hashing algorithm which is industry-standard for password security.
     * 
     * BCrypt features:
     * - Automatically generates salt
     * - Configurable strength (default: 10)
     * - Resistant to brute force attacks
     * 
     * @return BCryptPasswordEncoder instance for password hashing
     */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the security filter chain for HTTP requests.
     * Currently configured to permit all requests for simplified demo access.
     * 
     * Configuration:
     * - CSRF protection disabled (REST API doesn't need it)
     * - All requests permitted without authentication
     * - Actuator endpoints accessible without security
     * 
     * @param http the HttpSecurity object to configure
     * @return the configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
            );

        return http.build();
    }
}
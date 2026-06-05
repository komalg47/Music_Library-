package com.music_library.user_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration class for the User Service.
 * Configures Spring Security settings including authentication, authorization,
 * CORS, and password encoding.
 * 
 * Configuration includes:
 * - Disabling CSRF protection (for REST API)
 * - Permitting all requests without authentication (simplified for demo)
 * - BCrypt password encoder for secure password hashing
 * 
 * Security Features:
 * - Passwords are hashed using BCrypt before storage
 * - JWT tokens generated for authenticated sessions
 * - CORS configured separately for frontend access
 * 
 * Note: In a production environment, this should be enhanced with:
 * - JWT token validation filter
 * - Role-based access control (USER, ADMIN roles)
 * - Specific endpoint protection
 * - Session management
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Configuration
public class SecurityConfig {

    /**
     * Configures the password encoder for hashing user passwords.
     * Uses BCrypt hashing algorithm which is industry-standard for password security.
     * 
     * BCrypt features:
     * - Automatically generates salt for each password
     * - Configurable strength (default: 10 rounds)
     * - Resistant to rainbow table and brute force attacks
     * - Produces different hashes for the same password
     * 
     * @return BCryptPasswordEncoder instance for password hashing and verification
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
     * - Login and registration endpoints publicly accessible
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
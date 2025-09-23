package smarthost.backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import smarthost.backend.filters.JwtFilter;
import smarthost.backend.services.UserService;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SpringSecurityConfig {

    private final JwtFilter jwtAuthFilter;
    private final UserService userService;

    public SpringSecurityConfig(JwtFilter jwtAuthFilter, UserService userService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC ENDPOINTS - dostupni svima (GUEST pristup)
                        .requestMatchers("/auth/login", "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/apartments/**").permitAll() // Guest može da vidi apartmane
                        .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()   // Guest može da čita reviews
                        .requestMatchers("/contact/**").permitAll()  // Contact forma
                        .requestMatchers("/about").permitAll()       // About Us stranica
                        .requestMatchers("/amenities").permitAll() // Amenities list

                        // SWAGGER ENDPOINTS - Add these lines
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()

                        // AUTHENTICATED ENDPOINTS - samo prijavljeni korisnici
                        .requestMatchers("/auth/current-user").authenticated()
                        .requestMatchers("/profile/**").authenticated() // My Profile

                        // CLIENT ONLY ENDPOINTS - samo CLIENT
                        .requestMatchers("/reservations/**").hasRole("CLIENT") // Sve rezervacije - samo CLIENT
                        .requestMatchers("/bookings/**").hasRole("CLIENT")     // Booking history - samo CLIENT
                        .requestMatchers(HttpMethod.POST, "/reviews/**").hasRole("CLIENT") // Reviews - samo CLIENT

                        // ADMIN ONLY ENDPOINTS - samo ADMIN
                        .requestMatchers(HttpMethod.POST, "/apartments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/apartments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/apartments/**").hasRole("ADMIN")
                        .requestMatchers("/admin/reservations/**").hasRole("ADMIN")  // Admin pregled rezervacija
                        .requestMatchers("/admin/calendar/**").hasRole("ADMIN")     // Calendar management
                        .requestMatchers("/admin/finance/**").hasRole("ADMIN")      // Finance dashboard
                        .requestMatchers("/admin/**").hasRole("ADMIN")              // Admin panel

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) //
                )
                .authenticationProvider(authenticationProvider(passwordEncoder))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Angular port
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) { // PROVIDER FOR AUTHENTICATION
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService); // userService is used to load user by username from database
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
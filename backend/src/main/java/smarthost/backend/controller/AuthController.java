package smarthost.backend.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.UserDTO;
import smarthost.backend.requests.LoginRequest;
import smarthost.backend.response.LoginResponse;
import smarthost.backend.services.UserService;
import smarthost.backend.utils.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            if (authentication.isAuthenticated()) {
                String token = jwtUtil.generateToken(loginRequest.getEmail());
                UserDTO userDTO = userService.getUserDTOByEmail(loginRequest.getEmail());
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.setToken(token);
                loginResponse.setUser(userDTO);
                return ResponseEntity.ok(loginResponse);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }

}

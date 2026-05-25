package com.RedHope.Service;

import com.RedHope.DTOs.*;
import com.RedHope.Enums.NotificationType;
import com.RedHope.Enums.Role;
import com.RedHope.Model.User;
import com.RedHope.Model.UserProfile;
import com.RedHope.Repository.UserProfileRepo;
import com.RedHope.Repository.UserRepository;
import com.RedHope.Security.JWTUtils;
import com.RedHope.Utils.AuthHelper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final UserProfileRepo userProfileRepo;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository, EmailVerificationService emailVerificationService, ModelMapper modelMapper, PasswordEncoder passwordEncoder, JWTUtils jwtUtils, UserProfileRepo userProfileRepo, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.emailVerificationService = emailVerificationService;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.userProfileRepo = userProfileRepo;
        this.notificationService = notificationService;
    }


    public ResponseEntity<?> signup(SignupDTO signupRequest) {
        try {
            String email = signupRequest.getEmail().toLowerCase();

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Oops! Looks like you’re already registered. Login instead?"));
            }

            User user = new User();
            user.setEmail(signupRequest.getEmail());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setActive(false);
            user.setVerified(false);
            user.setCreatedTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            user.setRole(Role.USER);
            emailVerificationService.sendEmailVerificationLink(user.getEmail());
            userRepository.save(user);
            log.info("User registered: {}, verification email sent.", email);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "User created. A verification link has been sent to your email."));
        } catch (Exception e) {
            log.error("Error registering user: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong. Please try again later."));
        }
    }

    public AuthResponseDTO login(LoginDTO loginDTO) throws RuntimeException{

        String email = loginDTO.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String storedPassword = user.getPassword();

        if (!AuthHelper.isBCryptEncoded(storedPassword)) {
            throw new RuntimeException("Please reset your password");
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), storedPassword)) {
            throw new RuntimeException("Invalid Password");
        }

        String accessToken = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail(), user.getRole());
        notificationService.sendNotification(user,"Login Alert at: "+LocalDateTime.now(),"If your are not please Change password",NotificationType.SYSTEM);
        return new AuthResponseDTO(accessToken, refreshToken,user.getRole().toString());
    }

    public ResponseEntity<?> forgetPassword(String email) {
        try {
            email = email.toLowerCase();
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Email not found"));
            }
            emailVerificationService.sendRecoveryOptionsEmail(email);
            log.info("Recovery email sent to {}", email);
            return ResponseEntity.ok(Map.of("message", "Recovery email sent. Please check your inbox."));
        } catch (Exception e) {
            log.error("Error sending recovery email: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong. Please try again later."));
        }
    }

    public ResponseEntity<?> resetPassword(ResetPasswordDTO passwordDTO) {
        try {
            TokenVerificationResult result = emailVerificationService.verifyToken(passwordDTO.getToken());
            if (!result.isSuccess()) return new ResponseEntity<>(Map.of("message", result.getMessage()),HttpStatus.BAD_REQUEST);
            String email = result.getEmail();
            User user = userRepository.findByEmail(email);
            user.setPassword(passwordEncoder.encode(passwordDTO.getPassword()));
            userRepository.save(user);
            notificationService.sendNotification(user,"Password Changed","Your password has been updated",NotificationType.SYSTEM);
            return new ResponseEntity<>(Map.of("message", "Password change successfully"),HttpStatus.CREATED);
        }catch (Exception e){
            log.error("Error Resting user password {}",e.getMessage());
            return new ResponseEntity<>(Map.of("message", "Something went wrong. Please try again later."),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public boolean validateAccessToken(String token) {
        try {
            String email = jwtUtils.extractEmail(token);
            return jwtUtils.validateToken(token,email);
        } catch (Exception e) {
            log.warn("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public String generateAccessTokenFromRefresh(String refreshToken) throws RuntimeException{
        try {
            String email = jwtUtils.extractEmail(refreshToken);

            // Check if refresh token is valid & not expired
            if (!jwtUtils.validateToken(refreshToken, email)) {
                throw new RuntimeException("Invalid or expired refresh token");
            }

            // Extract roles from refresh token
            String roleAsString = jwtUtils.extractRole(refreshToken);

            // Convert String to single Role enum
            Role role = Role.valueOf(roleAsString);

            // Generate new access token using email and roles
            return jwtUtils.generateToken(email, role);

        } catch (Exception e) {
            log.error("Failed to generate access token from refresh token: {}", e.getMessage());
            throw new RuntimeException("Could not generate access token");
        }
    }





    public ResponseEntity<?> verifyEmail(String token) {
        try {
            TokenVerificationResult result = emailVerificationService.verifyToken(token);
            if (result.isSuccess()) {
                String email = result.getEmail();
                User user = userRepository.findByEmail(email);
                user.setVerified(true);
                userRepository.save(user);
                notificationService.sendNotification(user,"Email Verified","Your email is verified",NotificationType.SYSTEM);
                log.info("Email verified: {}", email);
                return ResponseEntity.ok(Map.of("message", result.getMessage()));
            }

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", result.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying email token {}: {}", token, e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while verifying the email."));
        }
    }

    public ResponseEntity<?> resendVerificationLink(String email) {
        try {
            email = email.toLowerCase();
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Email not found"));
            }

            if (user.isVerified()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Email already verified"));
            }

            emailVerificationService.sendEmailVerificationLink(email);
            log.info("Verification link resent to {}", email);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "Verification link sent. Please check your email."));
        } catch (Exception e) {
            log.error("Error resending verification link: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong. Please try again later."));
        }
    }

    public AuthResponseDTO directLogin(String token) throws RuntimeException{
        try{
            TokenVerificationResult result = emailVerificationService.verifyToken(token);
            if (!result.isSuccess()) {
                throw new RuntimeException(result.getMessage());
            }
            String email = result.getEmail();
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            String accessToken = jwtUtils.generateToken(user.getEmail(), user.getRole());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail(), user.getRole());

            return new AuthResponseDTO(accessToken, refreshToken,user.getRole().toString());
        }catch(RuntimeException e){
            throw new RuntimeException(e.getMessage());
        }catch (Exception e){
            log.error("Error generating token: {}",e.getMessage());
            throw new RuntimeException("User not found");
        }

    }


    public AuthResponseDTO processOAuthPostLogin(String fullName, String email) {
        email = email.toLowerCase();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setVerified(true); // Google email is already verified
            newUser.setActive(true);
            newUser.setCreatedTime(LocalDateTime.now());
            newUser.setUpdateTime(LocalDateTime.now());
            newUser.setRole(Role.USER);

            // Random encoded password, since login is via Google only
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            userRepository.save(newUser);
            log.info("New Google OAuth user created: {}", email);
        }
        String accessToken = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail(), user.getRole());
        return new AuthResponseDTO(accessToken, refreshToken,user.getRole().toString());
    }

    @Transactional
    public String updateProfile(String username, UserProfileUpdateDTO dto) {

        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("You can't change your admin role");
        }

        UserProfile profile = user.getProfile();

        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        profile.setName(dto.getName());
        profile.setDob(dto.getDob());
        profile.setPhone(dto.getPhone());
        profile.setGender(dto.getGender());
        profile.setBloodGroup(dto.getBloodGroup());
        profile.setRhFactor(dto.getRhFactor());
        profile.setCity(dto.getCity());
        profile.setLat(dto.getLat());
        profile.setLon(dto.getLon());

        userProfileRepo.save(profile);
        notificationService.sendNotification(user,"Profile updated","Your profile details are updated at: "+LocalDateTime.now(),NotificationType.SYSTEM);
        return "Profile updated";
    }

    public UserProfileGetDTO getUserProfile(String username) {

        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        UserProfile profile = user.getProfile();
        if (profile == null) {throw new RuntimeException("User not found");}

        UserProfileGetDTO dto = modelMapper.map(profile, UserProfileGetDTO.class);

        return dto;
    }

    public String getUserRole(String username) {
        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getRole().toString();
    }
}

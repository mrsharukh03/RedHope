package com.RedHope.Controller;

import com.RedHope.DTOs.BloodRequestResponseDTO;
import com.RedHope.DTOs.UserProfileGetDTO;
import com.RedHope.DTOs.UserProfileUpdateDTO;
import com.RedHope.Service.BloodServices;
import com.RedHope.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    private final UserService userService;
    private final BloodServices bloodServices;

    @Autowired
    public UserController(UserService userService, BloodServices bloodServices) {
        this.userService = userService;
        this.bloodServices = bloodServices;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileGetDTO> getProfile(@AuthenticationPrincipal UserDetails user) {
        UserProfileGetDTO userProfile = userService.getUserProfile(user.getUsername());
        return new ResponseEntity<>(userProfile, HttpStatus.OK);
    }

    @PostMapping("/update/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateProfile(@RequestBody @Valid UserProfileUpdateDTO userProfile,@AuthenticationPrincipal UserDetails userDetails) {
        String response = userService.updateProfile(userDetails.getUsername(),userProfile);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blood/request/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getBloodRequest(@PathVariable UUID id) {
        BloodRequestResponseDTO bloodRequest = bloodServices.getBloodRequestById(id);
        if (bloodRequest == null) {throw new RuntimeException("blood request not found");}
        return ResponseEntity.ok(bloodRequest);
    }

}

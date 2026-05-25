package com.RedHope.Controller;

import com.RedHope.DTOs.BloodRequestDTO;
import com.RedHope.DTOs.BloodRequestResponseDTO;
import com.RedHope.DTOs.BloodRequestUpdateDTO;
import com.RedHope.DTOs.UserProfileResponseDTO;
import com.RedHope.Service.BloodServices;
import com.RedHope.Service.ReceiverService;
import com.RedHope.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/reciver")
public class ReceiverController {

    private final UserService userService;
    private final BloodServices bloodServices;
    private final ReceiverService receiverService;

    public ReceiverController(UserService userService, BloodServices bloodServices, ReceiverService receiverService) {
        this.userService = userService;
        this.bloodServices = bloodServices;
        this.receiverService = receiverService;
    }

    @PostMapping("/blood-request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBloodRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid BloodRequestDTO dto) {

        String response = bloodServices.createRequest(
                userDetails.getUsername(),
                dto
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/request-update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateBloodRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid BloodRequestUpdateDTO dto) {

        String response = bloodServices.updateRequest(
                userDetails.getUsername(),
                dto
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/myrequest")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<BloodRequestResponseDTO>> getMyRequests(@AuthenticationPrincipal UserDetails userDetails) {
        List<BloodRequestResponseDTO> responseDTOS = receiverService.getMyRequests(userDetails.getUsername());
        return new ResponseEntity<>(responseDTOS, HttpStatus.OK);
    }

    @PostMapping("/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> completeRequest(@RequestParam UUID requestId, @AuthenticationPrincipal UserDetails userDetails){
        String response = receiverService.completeRequest(requestId,userDetails.getUsername());
        return new  ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> cancelRequest(@RequestParam UUID requestId, @AuthenticationPrincipal UserDetails userDetails){
        String response = receiverService.cancelRequest(requestId,userDetails.getUsername());
        return new  ResponseEntity<>(response, HttpStatus.OK);
    }



    @GetMapping("/recommend-donors")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getRecommendedDoners(@AuthenticationPrincipal UserDetails userDetails) {
        List<UserProfileResponseDTO> getDoners = receiverService.getRecommendedDonors(userDetails.getUsername());
        return new  ResponseEntity<>(getDoners, HttpStatus.OK);
    }

}

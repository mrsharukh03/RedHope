package com.RedHope.Controller;

import com.RedHope.DTOs.BloodDonationHistory;
import com.RedHope.DTOs.DonationRecommendDTO;
import com.RedHope.Enums.DonationStatus;
import com.RedHope.Repository.UserRepository;
import com.RedHope.Service.BloodServices;
import com.RedHope.Service.DonorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/donor")
public class DonatorController {

    private final UserRepository userRepo;
    private final DonorService donorService;
    private final BloodServices  bloodServices;

    public DonatorController(UserRepository userRepo, DonorService donorService, BloodServices bloodServices) {
        this.userRepo = userRepo;
        this.donorService = donorService;
        this.bloodServices = bloodServices;
    }


    @GetMapping("/recommend-requests")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getRecommendedDonations(@AuthenticationPrincipal UserDetails userDetails) {
        List<DonationRecommendDTO> getDoners = donorService.getRecommendedDonations(userDetails.getUsername());
        return new  ResponseEntity<>(getDoners, HttpStatus.OK);
    }

    @PostMapping("/respond/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> responseDonationById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestParam String status) { // e.g., ?status=ACCEPTED

        String message = donorService.respondToRequest(id, userDetails.getUsername(), status);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getBloodRequestHistory( @AuthenticationPrincipal UserDetails userDetails) {
        List<BloodDonationHistory> bloodHistoryDTO =  bloodServices.getBloodDonationHistory(userDetails.getUsername());
        return new  ResponseEntity<>(bloodHistoryDTO, HttpStatus.OK);
    }

    @PostMapping("/donation/{donationId}/status")
    public ResponseEntity<?> updateDonationStatus(
            @PathVariable UUID donationId,
            @RequestParam DonationStatus status,@AuthenticationPrincipal UserDetails userDetails
    ) {

        String updatedDonation =
                donorService.updateDonationStatus(userDetails.getUsername(),donationId, status);

        return ResponseEntity.ok(updatedDonation);
    }
}

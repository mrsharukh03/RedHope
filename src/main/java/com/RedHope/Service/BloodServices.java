package com.RedHope.Service;

import com.RedHope.DTOs.BloodDonationHistory;
import com.RedHope.DTOs.BloodRequestDTO;
import com.RedHope.DTOs.BloodRequestResponseDTO;
import com.RedHope.DTOs.BloodRequestUpdateDTO;
import com.RedHope.Enums.RequestStatus;
import com.RedHope.Model.BloodRequest;
import com.RedHope.Model.Donation;
import com.RedHope.Model.User;
import com.RedHope.Model.UserProfile;
import com.RedHope.Repository.BloodRequestRepo;
import com.RedHope.Repository.DonationRepository;
import com.RedHope.Repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BloodServices {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final BloodRequestRepo bloodRequestRepo;
    private final DonationRepository donationRepository;

    @Transactional
    public String createRequest(String username, @Valid BloodRequestDTO dto) {
        User user = getUser(username);
        UserProfile userProfile = user.getProfile();

        if (userProfile == null) {
            throw new RuntimeException("Please complete your medical profile before requesting blood.");
        }

        validateAndSetDailyRequestLimit(userProfile);

        if (bloodRequestRepo.existsByRequesterAndStatus(user, RequestStatus.OPEN)) {
            throw new RuntimeException("You already have an active blood request. Please close it first.");
        }

        BloodRequest bloodRequest = modelMapper.map(dto, BloodRequest.class);
        bloodRequest.setRequester(user);
        bloodRequest.setRequestDate(LocalDateTime.now());
        bloodRequest.setStatus(RequestStatus.OPEN);

        bloodRequestRepo.save(bloodRequest);
        log.info("New blood request created for user: {} with status OPEN", username);

        return "Blood request created successfully. Our matching engine is searching for donors near " + bloodRequest.getCity() + ".";
    }

    public BloodRequestResponseDTO getBloodRequestById(UUID requestId) {
        BloodRequest bloodRequest = bloodRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Blood request not found with id: " + requestId));

        return modelMapper.map(bloodRequest, BloodRequestResponseDTO.class);
    }

    @Transactional(readOnly = true)
    public List<BloodDonationHistory> getBloodDonationHistory(String email) {
        User user = getUser(email);
        List<Donation> donations = donationRepository.findByDonorOrderByAcceptedAtDesc(user);

        return donations.stream().map(donation -> {
            BloodRequest request = donation.getBloodRequest();
            BloodDonationHistory dto = new BloodDonationHistory();

            dto.setRequestId(request.getId());
            dto.setDonationId(donation.getId());
            dto.setPatientName(request.getPatientName());
            dto.setBloodGroup(request.getBloodGroup());
            dto.setUnitsRequired(request.getUnitsRequired());
            dto.setCity(request.getCity());
            dto.setHospitalName(request.getHospitalName());
            dto.setDonorName(getProfileName(donation.getDonor(), "Unknown Donor"));
            dto.setRequesterName(getProfileName(donation.getRequester(), "Unknown Requester"));
            dto.setStatus(donation.getStatus() != null ? donation.getStatus().name() : "PENDING");
            dto.setDonationDate(donation.getDonationDate());
            dto.setAcceptedAt(donation.getAcceptedAt());
            dto.setCompletedAt(donation.getCompletedAt());

            return dto;
        }).toList();
    }

    @Transactional
    public String updateRequest(String username, @Valid BloodRequestUpdateDTO dto) {
        User user = getUser(username);

        BloodRequest bloodRequest = bloodRequestRepo.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Blood request not found with id: " + dto.getRequestId()));

        // Ownership check
        if (!bloodRequest.getRequester().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this request.");
        }

        if (bloodRequest.getStatus() != RequestStatus.OPEN) {
            throw new RuntimeException("Only OPEN requests can be updated.");
        }

        // Update fields
        bloodRequest.setPatientName(dto.getPatientName());
        bloodRequest.setBloodGroup(dto.getBloodGroup());
        bloodRequest.setUnitsRequired(dto.getUnitsRequired());
        bloodRequest.setCity(dto.getCity());
        bloodRequest.setHospitalName(dto.getHospitalName());
        bloodRequest.setHospitalAddress(dto.getHospitalAddress());
        bloodRequest.setDescription(dto.getNotes());

        bloodRequestRepo.save(bloodRequest);
        log.info("Blood request updated by user: {}", username);

        return "Blood request updated successfully.";
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private User getUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        return user;
    }

    private void validateAndSetDailyRequestLimit(UserProfile userProfile) {
        LocalDate today = LocalDate.now();

        if (userProfile.getLastRequestDate() == null || !userProfile.getLastRequestDate().equals(today)) {
            // First request ever OR New day reset
            userProfile.setLastRequestDate(today);
            userProfile.setRequestCount(1);
        } else {
            // Same day requests
            int currentCount = userProfile.getRequestCount() == null ? 0 : userProfile.getRequestCount();
            if (currentCount >= 3) {
                throw new RuntimeException("Daily blood request limit exceeded. Please try again tomorrow.");
            }
            userProfile.setRequestCount(currentCount + 1);
        }
    }

    private String getProfileName(User user, String defaultName) {
        return (user != null && user.getProfile() != null && user.getProfile().getName() != null)
                ? user.getProfile().getName()
                : defaultName;
    }
}
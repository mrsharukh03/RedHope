package com.RedHope.Service;

import com.RedHope.DTOs.DonationRecommendDTO;
import com.RedHope.Enums.DonationStatus;
import com.RedHope.Enums.NotificationType;
import com.RedHope.Enums.RequestStatus;
import com.RedHope.Model.*;
import com.RedHope.Repository.BloodRequestRepo;
import com.RedHope.Repository.DonationRepository;
import com.RedHope.Repository.MatchLogRepo;
import com.RedHope.Repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonorService {

    private final UserRepository userRepository;
    private final BloodRequestRepo bloodRequestRepo;
    private final MatchLogRepo matchLogRepo;
    private final ModelMapper modelMapper;
    private final DonationRepository donationRepository;
    private final NotificationService notificationService;

    private static final double SEARCH_RADIUS_KM = 20.0;

    @Transactional(readOnly = true)
    public List<DonationRecommendDTO> getRecommendedDonations(String username) {
        User donor = getDonor(username);
        UserProfile profile = donor.getProfile();

        if (profile == null) {
            throw new RuntimeException("Donor profile not found.");
        }

        List<String> compatibleRecipientGroups = getCompatibleRecipientGroups(profile.getBloodGroup());

        List<BloodRequest> nearbyRequests = bloodRequestRepo.findNearestRequests(
                compatibleRecipientGroups,
                profile.getLat(),
                profile.getLon(),
                SEARCH_RADIUS_KM,
                donor.getId()
        );

        return nearbyRequests.stream().map(request -> {
            DonationRecommendDTO dto = modelMapper.map(request, DonationRecommendDTO.class);
            double dist = calculateDistance(
                    profile.getLat(), profile.getLon(),
                    request.getLatitude(), request.getLongitude()
            );
            dto.setDistanceKm(Math.round(dist * 100.0) / 100.0);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public String respondToRequest(UUID requestId, String donorEmail, String responseStatus) {
        User donor = getDonor(donorEmail);

        BloodRequest request = bloodRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getRequester().getId().equals(donor.getId())) {
            throw new RuntimeException("You cannot respond to your own request.");
        }

        MatchLog match = matchLogRepo.findByBloodRequestAndDonor(request, donor).orElse(new MatchLog());
        match.setBloodRequest(request);
        match.setDonor(donor);
        match.setStatus(responseStatus.toUpperCase());
        matchLogRepo.save(match);

        if (responseStatus.equalsIgnoreCase("ACCEPTED")) {
            Donation donation = new Donation();
            donation.setBloodRequest(request);
            donation.setDonor(donor);
            donation.setRequester(request.getRequester());
            donation.setStatus(DonationStatus.INITIATED);
            donation.setAcceptedAt(LocalDateTime.now());

            donationRepository.save(donation);

            request.setStatus(RequestStatus.ACCEPTED);
            bloodRequestRepo.save(request);

            // ==========================================
            // NOTIFY REQUESTER: Donor has accepted
            // ==========================================
            String donorName = (donor.getProfile() != null && donor.getProfile().getName() != null)
                    ? donor.getProfile().getName() : "A donor";

            notificationService.sendNotification(
                    request.getRequester(),
                    "Blood Donor Found! 🩸",
                    "Good news! " + donorName + " has accepted your request for " + request.getBloodGroup() + " blood.",
                    NotificationType.DONATION_ACCEPTED
            );
        }

        log.info("Donor {} responded {} to Request {}", donorEmail, responseStatus, requestId);
        return "Response recorded successfully!";
    }

    @Transactional
    public String updateDonationStatus(String username, UUID donationId, DonationStatus newStatus) {
        User donor = getDonor(username);

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found."));

        if (!donation.getDonor().getId().equals(donor.getId())) {
            throw new RuntimeException("You are not authorized to update this donation.");
        }

        validateStatusTransition(donation.getStatus(), newStatus);
        donation.setStatus(newStatus);

        switch (newStatus) {
            case COMPLETED -> {
                handleCompletedDonation(donation, donor);

                // ==========================================
                // NOTIFY REQUESTER: Donation is completed
                // ==========================================
                notificationService.sendNotification(
                        donation.getRequester(),
                        "Donation Completed! 🎉",
                        "Your blood request has been successfully fulfilled. We hope the patient is doing well!",
                        NotificationType.DONATION_STATUS_UPDATE
                );

                // ==========================================
                // NOTIFY DONOR: Reward points added
                // ==========================================
                notificationService.sendNotification(
                        donor,
                        "Reward Points Earned! ⭐",
                        "Thank you for your life-saving donation! Reward points have been added to your profile.",
                        NotificationType.REWARD_EARNED
                );
            }
            case CANCELLED -> {
                BloodRequest request = donation.getBloodRequest();
                request.setStatus(RequestStatus.OPEN);
                bloodRequestRepo.save(request);

                // ==========================================
                // NOTIFY REQUESTER: Donation cancelled, request reopened
                // ==========================================
                notificationService.sendNotification(
                        donation.getRequester(),
                        "Donation Cancelled ⚠️",
                        "The donor had to cancel the donation. Don't worry, your request has been reopened for other donors.",
                        NotificationType.URGENT_ALERT
                );
            }
            default -> {
                // ==========================================
                // NOTIFY REQUESTER: Any other status updates (e.g., IN_PROGRESS)
                // ==========================================
                notificationService.sendNotification(
                        donation.getRequester(),
                        "Donation Status Updated",
                        "The status of your donation has been updated to: " + newStatus.name(),
                        NotificationType.DONATION_STATUS_UPDATE
                );
            }
        }

        donationRepository.save(donation);
        return "Donation status updated successfully!";
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private User getDonor(String email) {
        User donor = userRepository.findByEmail(email);
        if (donor == null) {
            throw new RuntimeException("Donor not found with email: " + email);
        }
        return donor;
    }

    private void handleCompletedDonation(Donation donation, User donor) {
        donation.setCompletedAt(LocalDateTime.now());

        BloodRequest request = donation.getBloodRequest();
        request.setStatus(RequestStatus.FULFILLED);
        bloodRequestRepo.save(request);

        UserProfile profile = donor.getProfile();
        if (profile == null) {
            throw new RuntimeException("Donor profile not found.");
        }

        int earnedPoints = calculateRewardPoints(donor, request);
        int currentPoints = profile.getRewardPoints() == null ? 0 : profile.getRewardPoints();
        profile.setRewardPoints(currentPoints + earnedPoints);

        profile.setDonorRank(calculateRank(profile.getRewardPoints()));
        profile.setLastDonationDate(LocalDate.now());
    }

    private void validateStatusTransition(DonationStatus current, DonationStatus next) {
        if (current == next) return;

        if (current == DonationStatus.COMPLETED) {
            throw new RuntimeException("Completed donation cannot be modified.");
        }
        if (current == DonationStatus.CANCELLED) {
            throw new RuntimeException("Cancelled donation cannot be modified.");
        }
        if (next == DonationStatus.CANCELLED) {
            return; // Can cancel from any open state
        }

        // Strict forward-only sequence
        if (next.ordinal() != current.ordinal() + 1) {
            throw new RuntimeException("Invalid status transition from " + current + " to " + next);
        }
    }

    private int calculateRewardPoints(User donor, BloodRequest request) {
        int points = 0;
        int units = request.getUnitsRequired() == null ? 1 : request.getUnitsRequired();

        points += units * 50;

        if (request.getUrgency() != null && request.getUrgency().equalsIgnoreCase("Critical")) {
            points += 100;
        }

        String bloodGroup = donor.getProfile().getBloodGroup();
        if ("O-".equalsIgnoreCase(bloodGroup) || "AB-".equalsIgnoreCase(bloodGroup)) {
            points += 50;
        }

        return points;
    }

    private String calculateRank(int points) {
        if (points >= 3000) return "Humanity Legend";
        if (points >= 1500) return "RedHope Champion";
        if (points >= 700)  return "Blood Guardian";
        if (points >= 300)  return "Community Hero";
        if (points >= 100)  return "Life Saver";
        return "New Donor";
    }

    private List<String> getCompatibleRecipientGroups(String donorGroup) {
        return switch (donorGroup) {
            case "O-" -> List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+");
            case "O+" -> List.of("O+", "A+", "B+", "AB+");
            case "A-" -> List.of("A-", "A+", "AB-", "AB+");
            case "A+" -> List.of("A+", "AB+");
            case "B-" -> List.of("B-", "B+", "AB-", "AB+");
            case "B+" -> List.of("B+", "AB+");
            case "AB-" -> List.of("AB-", "AB+");
            case "AB+" -> List.of("AB+");
            default -> List.of(donorGroup);
        };
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
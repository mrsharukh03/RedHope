package com.RedHope.Service;

import com.RedHope.DTOs.BloodRequestResponseDTO;
import com.RedHope.DTOs.UserProfileResponseDTO;
import com.RedHope.Enums.DonationStatus;
import com.RedHope.Enums.NotificationType;
import com.RedHope.Enums.RequestStatus;
import com.RedHope.Model.BloodRequest;
import com.RedHope.Model.Donation;
import com.RedHope.Model.User;
import com.RedHope.Model.UserProfile;
import com.RedHope.Repository.BloodRequestRepo;
import com.RedHope.Repository.DonationRepository;
import com.RedHope.Repository.UserProfileRepo;
import com.RedHope.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Slf4j
@Service
public class ReceiverService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final BloodRequestRepo bloodRequestRepo;
    private final UserProfileRepo userProfileRepo;
    private final NotificationService notificationService;
    private final DonationRepository donationRepository;

    public ReceiverService(UserRepository userRepository,
                           ModelMapper modelMapper,
                           BloodRequestRepo bloodRequestRepo,
                           UserProfileRepo userProfileRepo, NotificationService notificationService, DonationRepository donationRepository) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.bloodRequestRepo = bloodRequestRepo;
        this.userProfileRepo = userProfileRepo;
        this.notificationService = notificationService;
        this.donationRepository = donationRepository;
    }

    // ----------------------------
    // My Requests
    // ----------------------------
    public List<BloodRequestResponseDTO> getMyRequests(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return bloodRequestRepo.findByRequesterOrderByRequestDateDesc(user)
                .stream()
                .map(req -> modelMapper.map(req, BloodRequestResponseDTO.class))
                .toList();
    }

    // ----------------------------
    // Complete Request
    // ----------------------------
    @Transactional
    public String completeRequest(UUID requestId, String email) {

        BloodRequest request = bloodRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized action");
        }

        request.setStatus(RequestStatus.FULFILLED);
        bloodRequestRepo.save(request);

        log.info("Request {} marked COMPLETED by {}", requestId, email);
        return "Request closed successfully";
    }

    @Transactional
    public String cancelRequest(UUID requestId, String username) {
        // 1. Fetch the Request
        BloodRequest request = bloodRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 2. Authorization Check
        if (!request.getRequester().getEmail().equals(username)) {
            throw new RuntimeException("Unauthorized action: You can only cancel your own requests.");
        }

        // 3. Status Validation
        if (request.getStatus() == RequestStatus.FULFILLED ||
                request.getStatus() == RequestStatus.EXPIRED ||
                request.getStatus() == RequestStatus.CANCELLED) {
            throw new RuntimeException("Request is already " + request.getStatus().name() + " and cannot be cancelled.");
        }

        // 4. Update Request Status
        request.setStatus(RequestStatus.CANCELLED);
        bloodRequestRepo.save(request);

        // ==========================================
        // NOTIFY DONORS & CANCEL ACTIVE DONATIONS
        // ==========================================

        // Fetch all donations linked to this request
        // Note: Make sure `findByBloodRequest` exists in your DonationRepository
        List<Donation> associatedDonations = donationRepository.findByBloodRequest(request);

        for (Donation donation : associatedDonations) {
            // Sirf active donations ko cancel aur notify karenge (jo pehle se complete/cancel nahi hain)
            if (donation.getStatus() != DonationStatus.COMPLETED &&
                    donation.getStatus() != DonationStatus.CANCELLED) {

                // Donation ko cancel mark karo
                donation.setStatus(DonationStatus.CANCELLED);
                donationRepository.save(donation);

                // Donor ko notification bhejo
                notificationService.sendNotification(
                        donation.getDonor(),
                        "Request Cancelled ⚠️",
                        "The blood request for patient " + request.getPatientName() + " has been cancelled by the requester. Thank you for your willingness to help!",
                        NotificationType.URGENT_ALERT
                );
            }
        }

        log.info("Request {} cancelled by user {}. Associated donors notified.", requestId, username);
        return "Request cancelled successfully and donors have been notified.";
    }


    // ----------------------------
    // 🔥 MAIN FIXED LOGIC: Donor Recommendation
    // ----------------------------
    public List<UserProfileResponseDTO> getRecommendedDonors(String email) {

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        BloodRequest activeRequest = bloodRequestRepo
                .findByRequesterAndStatus(user, RequestStatus.OPEN)
                .orElseThrow(() -> new RuntimeException("No active request found"));

        String bloodGroup = activeRequest.getBloodGroup().trim().toUpperCase();

        List<String> compatibleGroups = getCompatibleDonorGroups(bloodGroup);

        List<UserProfile> donors = userProfileRepo.findNearestDonors(
                compatibleGroups,
                activeRequest.getLatitude(),
                activeRequest.getLongitude(),
                20.0,
                user.getId()
        );

        return donors.stream()
                .filter(d -> d.getLat() != null && d.getLon() != null)
                .map(d -> {
                    UserProfileResponseDTO dto = modelMapper.map(d, UserProfileResponseDTO.class);

                    double distance = calculateDistance(
                            activeRequest.getLatitude(),
                            activeRequest.getLongitude(),
                            d.getLat(),
                            d.getLon()
                    );

                    dto.setDistanceKm(Math.round(distance * 100.0) / 100.0);
                    return dto;
                })
                .toList();
    }

    // ----------------------------
    // Distance Calculator
    // ----------------------------
    private double calculateDistance(double lat1, double lon1,
                                     double lat2, double lon2) {

        double R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2)
                * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // ----------------------------
    // Blood Compatibility
    // ----------------------------
    private List<String> getCompatibleDonorGroups(String receiverGroup) {

        return switch (receiverGroup) {
            case "O-" -> List.of("O-");
            case "O+" -> List.of("O-", "O+");
            case "A-" -> List.of("O-", "A-");
            case "A+" -> List.of("O-", "O+", "A-", "A+");
            case "B-" -> List.of("O-", "B-");
            case "B+" -> List.of("O-", "O+", "B-", "B+");
            case "AB-" -> List.of("O-", "A-", "B-", "AB-");
            case "AB+" -> List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+");
            default -> List.of(receiverGroup);
        };
    }

}

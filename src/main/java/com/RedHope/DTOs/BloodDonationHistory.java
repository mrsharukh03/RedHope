package com.RedHope.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodDonationHistory {

    private UUID requestId;

    private UUID donationId;

    private String patientName;

    private String bloodGroup;

    private Integer unitsRequired;

    private String city;

    private String hospitalName;

    private String donorName;

    private String requesterName;

    private String status;

    private LocalDate donationDate;

    private LocalDateTime acceptedAt;

    private LocalDateTime completedAt;
}
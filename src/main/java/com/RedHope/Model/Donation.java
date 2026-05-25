package com.RedHope.Model;

import com.RedHope.Enums.DonationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Data @NoArgsConstructor @AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    private BloodRequest bloodRequest;

    @ManyToOne
    private User donor;

    @ManyToOne
    private User requester;

    @Enumerated(EnumType.STRING)
    private DonationStatus status;

    private LocalDateTime acceptedAt;

    private LocalDateTime completedAt;

    private String donorPhone;

    private String requesterPhone;

    private String hospitalName;

    private String hospitalAddress;

    private LocalDate donationDate;

    private String notes;
}

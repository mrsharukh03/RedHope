package com.RedHope.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class DonationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private User donor;

    private LocalDate donationDate;
    private String hospitalLocation;
    private String certificateUrl;
    private boolean isVerifiedByAdmin = false;
}
package com.RedHope.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Data @NoArgsConstructor @AllArgsConstructor
public class UserProfile {

    @Id
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 150)
    private String name; //

    @Column(length = 20, unique = true)
    private String phone; //

    private LocalDate dob; //

    @Column(length = 10)
    private String gender; //

    private String donorRank;
    private Integer rewardPoints = 0;

    @Column(name = "blood_group", nullable = false, length = 5)
    private String bloodGroup; //

    @Column(name = "rh_factor", length = 10)
    private String rhFactor; //

    private LocalDate lastDonationDate; //
    private LocalDate lastRequestDate;
    private Integer requestCount = 0;

    private Double lat; //
    private Double lon; //
    private String city; //

    @Column(columnDefinition = "TEXT")
    private String healthConditions; //

    private String profileUrl;

    private boolean isAvailable = true; //
}

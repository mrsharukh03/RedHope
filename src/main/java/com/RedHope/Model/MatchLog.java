package com.RedHope.Model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class MatchLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private BloodRequest bloodRequest;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private User donor;

    private Double distanceKm;
    private String status; // NOTIFIED, ACCEPTED, REJECTED, COMPLETED
}

package com.RedHope.Model;

import com.RedHope.Enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class BloodRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    private String patientName;
    private String bloodGroup;
    private Integer unitsRequired;
    private String hospitalName;
    private String  hospitalAddress;
    private String city;
    private Double latitude;
    private Double longitude;

    private String urgency; // Critical / Normal
    private RequestStatus status;
    private String description;
    @CreationTimestamp
    private LocalDateTime requestDate;
}

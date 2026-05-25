package com.RedHope.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodRequestResponseDTO {

    private UUID id;

    private String patientName;

    private String bloodGroup;

    private Integer unitsRequired;

    private String hospitalName;

    private String city;

    private Double latitude;

    private Double longitude;

    private String urgency;

    private String status;

    private LocalDateTime requestDate;
}
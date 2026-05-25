package com.RedHope.DTOs;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserProfileResponseDTO {

    private UUID id;

    private String name;

    private String phone;

    private String bloodGroup;

    private String gender;

    private String city;

    private String donorRank;

    private Integer rewardPoints;

    private boolean isAvailable;

    private LocalDate lastDonationDate;

    private Double distanceKm;
}
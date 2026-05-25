package com.RedHope.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileGetDTO {

    private UUID id;

    private String name;

    private String phone;

    private LocalDate dob;

    private String gender;

    private String donorRank;

    private Integer rewardPoints;

    private String bloodGroup;

    private String rhFactor;

    private LocalDate lastDonationDate;

    private Double lat;

    private Double lon;

    private String city;

    private String healthConditions;

    private String profileUrl;

    private boolean isAvailable;
}
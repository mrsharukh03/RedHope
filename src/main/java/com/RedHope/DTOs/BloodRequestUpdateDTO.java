package com.RedHope.DTOs;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BloodRequestUpdateDTO {

    @NotNull(message = "Request ID is required")
    private UUID requestId;

    @NotBlank(message = "Patient name cannot be empty")
    private String patientName;

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @NotNull(message = "Units required is mandatory")
    @Min(value = 1, message = "Minimum 1 unit required")
    @Max(value = 10, message = "Maximum 10 units allowed")
    private Integer unitsRequired;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    private String hospitalAddress;

    private String notes;
}
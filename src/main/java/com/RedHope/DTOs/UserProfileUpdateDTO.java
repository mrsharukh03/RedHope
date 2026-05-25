package com.RedHope.DTOs;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateDTO {

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 150, message = "Name should be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @NotNull(message = "Date of Birth is required")
    @Past(message = "Date of Birth must be in the past")
    private LocalDate dob;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid Blood Group format (e.g., A+, O-)")
    private String bloodGroup;

    private String rhFactor;

    @Size(max = 500, message = "Health conditions description is too long")
    private String healthConditions;

    @NotNull(message = "Availability status must be specified")
    private boolean isAvailable;

    // Location Validations
    @NotNull(message = "Latitude is required for matching")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double lat;

    @NotNull(message = "Longitude is required for matching")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double lon;

    @NotBlank(message = "City name is required")
    private String city;

    private String profileUrl;

    @AssertTrue(message = "User must be at least 18 years old")
    public boolean isAdult() {
        return dob != null &&
                dob.isBefore(LocalDate.now().minusYears(18).plusDays(1));
    }
}
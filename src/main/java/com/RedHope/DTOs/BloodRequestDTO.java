package com.RedHope.DTOs;


import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodRequestDTO {

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 50, message = "Patient name must be between 2 and 50 characters")
    private String patientName;

    @NotBlank(message = "Blood group is required")
    @Pattern(
            regexp = "^(A|B|AB|O)[+-]$",
            message = "Invalid blood group. Example: A+, O-, AB+"
    )
    private String bloodGroup;

    @NotNull(message = "Units required is required")
    @Min(value = 1, message = "At least 1 unit is required")
    @Max(value = 20, message = "Maximum 20 units allowed")
    private Integer unitsRequired;

    @NotBlank(message = "Hospital name is required")
    @Size(min = 2, max = 100, message = "Hospital name must be between 2 and 100 characters")
    private String hospitalName;

    @NotBlank(message = "Hospital name is required")
    @Size(min = 2, max = 100, message = "Hospital Address must be between 2 and 100 characters")
    private String hospitalAddress;


    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City name must be between 2 and 50 characters")
    private String city;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    private Double longitude;

    @NotBlank(message = "Urgency is required")
    @Pattern(
            regexp = "^(Critical|Normal)$",
            message = "Urgency must be either Critical or Normal"
    )
    private String urgency;

    private String description;
}

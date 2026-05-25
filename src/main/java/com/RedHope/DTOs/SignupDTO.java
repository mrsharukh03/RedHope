package com.RedHope.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class SignupDTO {

    @NotNull @NotEmpty
    private String name;
    @NotNull @Email(message = "Please enter a valid email")
    private String email;
    @NotNull @NotEmpty
    private String password;
}

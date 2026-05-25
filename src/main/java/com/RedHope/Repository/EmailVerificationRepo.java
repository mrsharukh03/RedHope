package com.RedHope.Repository;

import com.RedHope.Model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepo extends JpaRepository<EmailVerification,String> {
    EmailVerification findByEmail(String email);
}

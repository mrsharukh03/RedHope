package com.RedHope.Repository;

import com.RedHope.Model.BloodRequest;
import com.RedHope.Model.Donation;
import com.RedHope.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DonationRepository extends JpaRepository<Donation, UUID> {
    List<Donation> findByDonor(User donor);

    List<Donation> findByDonorOrderByAcceptedAtDesc(User donor);
    List<Donation> findByBloodRequest(BloodRequest bloodRequest);
}

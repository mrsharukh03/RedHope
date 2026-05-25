package com.RedHope.Repository;

import com.RedHope.Model.BloodRequest;
import com.RedHope.Model.MatchLog;
import com.RedHope.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchLogRepo extends JpaRepository<MatchLog, UUID> {
    Optional<MatchLog> findByBloodRequestAndDonor(BloodRequest bloodRequest, User donor);


}

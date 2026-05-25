package com.RedHope.Repository;

import com.RedHope.Model.DonationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface DonationRecordRepo extends JpaRepository<DonationRecord, UUID> {
}

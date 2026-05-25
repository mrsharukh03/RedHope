package com.RedHope.Repository;

import com.RedHope.Enums.RequestStatus;
import com.RedHope.Model.BloodRequest;
import com.RedHope.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface BloodRequestRepo extends JpaRepository<BloodRequest, UUID> {
    boolean existsByRequesterAndStatus(User requester, RequestStatus status);


    List<BloodRequest> findByRequesterOrderByRequestDateDesc(User user);
    Optional<BloodRequest> findByRequesterAndStatus(
            User requester,
            RequestStatus status
    );

    @Query(value = "SELECT * FROM blood_request r " +
            "WHERE r.blood_group IN :groups " +
            "AND r.status = 'OPEN' " +
            "AND r.requester_id != :donorId " +
            "AND (6371 * acos(cos(radians(:lat)) * cos(radians(r.latitude)) * " +
            "cos(radians(r.longitude) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(r.latitude)))) < :distance", nativeQuery = true)
    List<BloodRequest> findNearestRequests(
            @Param("groups") List<String> groups,
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("distance") Double distance,
            @Param("donorId") UUID donorId   // ✅ ADD THIS
    );
}

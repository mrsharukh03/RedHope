package com.RedHope.Repository;

import com.RedHope.Model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface UserProfileRepo extends JpaRepository<UserProfile, UUID> {

    @Query(value = "SELECT * FROM user_profiles p " +
            "WHERE p.blood_group IN :compatibleGroups " +
            "AND p.is_available = true " +
            "AND p.user_id != :currentUserId " +
            "AND (6371 * acos(cos(radians(:lat)) * cos(radians(p.lat)) * " +
            "cos(radians(p.lon) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(p.lat)))) < :distance", nativeQuery = true)
    List<UserProfile> findNearestDonors(
            @Param("compatibleGroups") List<String> compatibleGroups,
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("distance") Double distance,
            @Param("currentUserId") UUID currentUserId
    );
}

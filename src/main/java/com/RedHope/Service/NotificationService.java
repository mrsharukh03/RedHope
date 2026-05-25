package com.RedHope.Service;

import com.RedHope.DTOs.NotificationDTO;
import com.RedHope.Enums.NotificationType;
import com.RedHope.Model.Notification;
import com.RedHope.Model.User;
import com.RedHope.Repository.NotificationRepo;
import com.RedHope.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepo notificationRepo;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    // ==========================================
    // 1. CREATE / SEND NOTIFICATION
    // ==========================================
    @Transactional
    public void sendNotification(
            User user,
            String title,
            String message,
            NotificationType type
    ) {

        // Null Safety
        if (user == null) {
            log.warn("Cannot send notification: User is null");
            return;
        }

        if (title == null || title.isBlank()) {
            title = "Notification";
        }

        if (message == null || message.isBlank()) {
            message = "You have a new notification.";
        }

        if (type == null) {
            type = NotificationType.SYSTEM;
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepo.save(notification);

        log.info(
                "Notification sent to User ID {} : {}",
                user.getId(),
                title
        );
    }

    // ==========================================
    // 2. GET ALL NOTIFICATIONS
    // ==========================================
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(
            String email
    ) {

        User user = getUser(email);

        List<Notification> notifications =
                notificationRepo
                        .findByUserOrderByCreatedAtDesc(user);

        // Empty safety
        if (notifications == null || notifications.isEmpty()) {
            return List.of();
        }

        return notifications.stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ==========================================
    // 3. GET UNREAD NOTIFICATIONS
    // ==========================================
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(
            String email
    ) {

        User user = getUser(email);

        List<Notification> notifications =
                notificationRepo
                        .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        // Empty safety
        if (notifications == null || notifications.isEmpty()) {
            return List.of();
        }

        return notifications.stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ==========================================
    // 4. MARK NOTIFICATION AS READ
    // ==========================================
    @Transactional
    public String markAsRead(
            UUID notificationId,
            String email
    ) {

        User user = getUser(email);

        Notification notification =
                notificationRepo.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        // Security Check
        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this notification"
            );
        }

        // Already read check
        if (notification.isRead()) {
            return "Notification already marked as read";
        }

        notification.setRead(true);

        notificationRepo.save(notification);

        return "Notification marked as read successfully";
    }

    // ==========================================
    // 5. MARK ALL NOTIFICATIONS AS READ
    // ==========================================
    @Transactional
    public String markAllAsRead(String email) {

        User user = getUser(email);

        List<Notification> notifications =
                notificationRepo
                        .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        if (notifications == null || notifications.isEmpty()) {
            return "No unread notifications found";
        }

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepo.saveAll(notifications);

        return "All notifications marked as read";
    }

    // ==========================================
    // 6. DELETE NOTIFICATION
    // ==========================================
    @Transactional
    public String deleteNotification(
            UUID notificationId,
            String email
    ) {

        User user = getUser(email);

        Notification notification =
                notificationRepo.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        // Security Check
        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this notification"
            );
        }

        notificationRepo.delete(notification);

        return "Notification deleted successfully";
    }

    // ==========================================
    // 7. COUNT UNREAD NOTIFICATIONS
    // ==========================================
    @Transactional(readOnly = true)
    public long countUnreadNotifications(String email) {

        User user = getUser(email);

        List<Notification> unreadNotifications =
                notificationRepo
                        .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        return unreadNotifications == null
                ? 0
                : unreadNotifications.size();
    }

    // ==========================================
    // HELPER : GET USER
    // ==========================================
    private User getUser(String email) {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email cannot be null or empty");
        }

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found with email: " + email
            );
        }

        return user;
    }

    // ==========================================
    // HELPER : ENTITY -> DTO
    // ==========================================
    private NotificationDTO mapToDTO(
            Notification notification
    ) {

        if (notification == null) {
            return null;
        }

        NotificationDTO dto =
                modelMapper.map(
                        notification,
                        NotificationDTO.class
                );

        // Extra safety
        if (dto == null) {
            dto = new NotificationDTO();
        }

        return dto;
    }
}
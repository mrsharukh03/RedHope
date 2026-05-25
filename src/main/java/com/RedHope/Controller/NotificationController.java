package com.RedHope.Controller;

import com.RedHope.DTOs.NotificationDTO;
import com.RedHope.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/v1/notifications
     * User ki saari notifications (read aur unread dono) fetch karne ke liye.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications(Principal principal) {
        log.info("Fetching all notifications for user: {}", principal.getName());
        List<NotificationDTO> notifications = notificationService.getUserNotifications(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/v1/notifications/unread
     * Sirf unread notifications fetch karne ke liye (Frontend par red dot/badge dikhane ke kaam aayega).
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Principal principal) {
        log.info("Fetching unread notifications for user: {}", principal.getName());
        List<NotificationDTO> unreadNotifications = notificationService.getUnreadNotifications(principal.getName());
        return ResponseEntity.ok(unreadNotifications);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(
            @PathVariable UUID notificationId,
            Principal principal) {

        log.info("User {} marking notification {} as read", principal.getName(), notificationId);
        String response = notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok(response);
    }
}
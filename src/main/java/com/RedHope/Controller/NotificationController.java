package com.RedHope.Controller;

import com.RedHope.DTOs.NotificationDTO;
import com.RedHope.Service.NotificationService;
import com.RedHope.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserService userService;


    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications(Principal principal) {
        log.info("Fetching all notifications for user: {}", principal.getName());
        List<NotificationDTO> notifications = notificationService.getUserNotifications(principal.getName());
        return ResponseEntity.ok(notifications);
    }


    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Principal principal) {
        log.info("Fetching unread notifications for user: {}", principal.getName());
        List<NotificationDTO> unreadNotifications = notificationService.getUnreadNotifications(principal.getName());
        return ResponseEntity.ok(unreadNotifications);
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(
            @PathVariable UUID notificationId,
            Principal principal) {

        log.info("User {} marking notification {} as read", principal.getName(), notificationId);
        String response = notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role")
    private ResponseEntity<?> getRole(@AuthenticationPrincipal UserDetails userDetails) {
        String response = userService.getUserRole(userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


}
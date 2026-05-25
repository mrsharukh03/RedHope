package com.RedHope.DTOs;

import com.RedHope.Enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {

    private UUID id;
    private String title;

    private String message;
    private NotificationType type;

    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}

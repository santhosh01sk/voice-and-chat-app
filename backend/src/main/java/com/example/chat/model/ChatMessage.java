package com.example.chat.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private String sender;
    private String content;
    private MessageType type;
    private String fileUrl; // For storing URL of shared video/audio
    private String fileName;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        IMAGE,
        VIDEO,
        AUDIO
    }
}

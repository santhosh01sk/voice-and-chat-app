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
    private String roomId;
    private MessageType type;
    private int onlineCount; // New field for user count
    private String fileUrl; // For storing URL of shared video/audio
    private String fileName;
    private String timestamp;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        IMAGE,
        VIDEO,
        AUDIO,
        VOICE_OFFER,
        VOICE_ANSWER,
        VOICE_CANDIDATE,
        GROUP_UPDATE
    }
}

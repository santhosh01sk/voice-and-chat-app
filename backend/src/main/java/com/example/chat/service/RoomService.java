package com.example.chat.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
    // roomId -> Set<username>
    private final Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

    public void addUser(String roomId, String username) {
        roomUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(username);
    }

    public void removeUser(String roomId, String username) {
        Set<String> users = roomUsers.get(roomId);
        if (users != null) {
            users.remove(username);
            if (users.isEmpty()) {
                roomUsers.remove(roomId);
            }
        }
    }

    public int getUserCount(String roomId) {
        Set<String> users = roomUsers.get(roomId);
        return users != null ? users.size() : 0;
    }
}

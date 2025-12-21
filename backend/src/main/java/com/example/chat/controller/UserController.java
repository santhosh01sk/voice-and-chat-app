package com.example.chat.controller;

import com.example.chat.model.UserEntity;
import com.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/search")
    public List<UserEntity> searchUsers(@RequestParam String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query);
    }

    @GetMapping("/{username}")
    public UserEntity getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @GetMapping("/all")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
}

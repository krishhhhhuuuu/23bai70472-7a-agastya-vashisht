package com.example.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> user) {

        if(user.get("username").equals("admin") && user.get("password").equals("1234")) {
            Map<String, String> res = new HashMap<>();
            res.put("token", "dummy-jwt-token-123");
            return res;
        }

        throw new RuntimeException("Invalid login");
    }

    @GetMapping("/protected")
    public String protectedRoute(@RequestHeader("Authorization") String token) {

        if(token.equals("Bearer dummy-jwt-token-123")) {
            return "Protected data 🔐";
        }

        throw new RuntimeException("Unauthorized");
    }
}
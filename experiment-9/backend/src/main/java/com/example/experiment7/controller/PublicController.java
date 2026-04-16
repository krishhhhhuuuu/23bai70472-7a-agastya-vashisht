package com.example.experiment7.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:3000")
public class PublicController {

    @GetMapping("/hello")
    public java.util.Map<String, String> hello() {
        return java.util.Map.of("message", "Public endpoint");
    }
}
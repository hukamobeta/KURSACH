package com.example.KURSACH.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "redirect:/app";
    }
    
    @GetMapping("/app/**")
    public String dashboard(Model model) {
        model.addAttribute("currentPage", "parking");
        return "dashboard";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/history")
    public String history(Model model) {
        model.addAttribute("currentPage", "history");
        return "history";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("currentPage", "profile");
        return "profile";
    }

    @GetMapping("/statistics")
    public String statistics(Model model) {
        model.addAttribute("currentPage", "stats");
        return "statistics";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }
}
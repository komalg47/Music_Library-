package com.music_library.admin_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.music_library.admin_service.dto.AdminLoginDTO;
import com.music_library.admin_service.entity.Admin;
import com.music_library.admin_service.service.AdminService;

@RestController
@RequestMapping("/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping
    public Admin saveAdmin(@RequestBody Admin admin) {
        return adminService.saveAdmin(admin);
    }

    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminService.getAllAdmins();
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginDTO loginDTO) {

        boolean success = adminService.loginAdmin(
                loginDTO.getEmail(),
                loginDTO.getPassword()
        );

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Login successful", "adminLoggedIn", true));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid admin credentials"));
    }
}
package com.music_library.admin_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.music_library.admin_service.entity.Admin;
import com.music_library.admin_service.repository.AdminRepository;
import com.music_library.admin_service.service.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Admin saveAdmin(Admin admin) {
        // Hash password before saving
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }

    @Override
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Override
    public boolean loginAdmin(String email, String password) {
        Admin admin = adminRepository.findByEmail(email);
        return admin != null && passwordEncoder.matches(password, admin.getPassword());
    }
}
package com.music_library.admin_service.service;

import java.util.List;
import com.music_library.admin_service.entity.Admin;

public interface AdminService {

    Admin saveAdmin(Admin admin);

    List<Admin> getAllAdmins();

    boolean loginAdmin(String email, String password);
}
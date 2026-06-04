package com.music_library.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.admin_service.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Admin findByEmail(String email);
}
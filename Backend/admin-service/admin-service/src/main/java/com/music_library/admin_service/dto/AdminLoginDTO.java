package com.music_library.admin_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginDTO {

    private String email;
    private String password;
}

package com.music_library.user_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginDTO {

    private String email;
    private String password;
}
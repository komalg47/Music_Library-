package com.music_library.admin_service.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {

    private String songName;

    private String artist;

    private String album;

    private String musicDirector;

    private LocalDate releaseDate;

    private boolean visible;

    private String coverImage;
}
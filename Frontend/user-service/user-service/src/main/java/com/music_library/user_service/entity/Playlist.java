package com.music_library.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "playlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long playlistId;

    private String playlistName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
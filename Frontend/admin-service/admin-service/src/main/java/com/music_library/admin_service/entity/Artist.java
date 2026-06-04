package com.music_library.admin_service.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity class representing an Artist in the Music Library.
 * Maps to the "artists" table in the database.
 * 
 * Artists are created either:
 * 1. Manually through the admin panel
 * 2. Automatically when songs are added with new artist names
 * 
 * The artist name is checked case-insensitively to avoid duplicates.
 * This entity is used to populate artist lists in both user and admin dashboards.
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Entity
@Table(name = "artists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Artist {

    /**
     * Unique identifier for the artist.
     * Auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long artistId;

    /**
     * Name of the artist or music director.
     * Example: "Arijit Singh", "A.R. Rahman", "Ed Sheeran"
     * Used for matching with song.artist field (case-insensitive).
     */
    private String artistName;
}
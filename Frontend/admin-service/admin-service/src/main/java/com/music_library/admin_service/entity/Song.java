package com.music_library.admin_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity class representing a Song in the Music Library.
 * Maps to the "songs" table in the database.
 * 
 * This entity stores complete information about a song including:
 * - Basic details (name, artist, album)
 * - Music director information
 * - Release date
 * - Visibility status
 * - Album cover image reference
 * 
 * The artist field is a simple string that references an artist name.
 * When a song is created/updated, the system automatically creates
 * a corresponding entry in the Artist table.
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Entity
@Table(name = "songs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Song {

    /**
     * Unique identifier for the song.
     * Auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long songId;

    /**
     * Name/title of the song.
     * Example: "Tum Hi Ho", "Shape of You"
     */
    private String songName;

    /**
     * Name of the artist who performed the song.
     * This field is used to link with the Artist entity.
     */
    private String artist;

    /**
     * Name of the album containing this song.
     * Example: "Aashiqui 2", "Divide"
     */
    private String album;

    /**
     * Name of the music director/composer.
     * Also automatically creates an artist entry.
     */
    private String musicDirector;

    /**
     * Date when the song was released.
     * Format: YYYY-MM-DD
     */
    private LocalDate releaseDate;

    /**
     * Visibility flag indicating if the song is visible to users.
     * true = visible, false = hidden
     */
    private boolean visible;

    /**
     * Filename or URL of the album cover image.
     * Stored in the asserts/images directory.
     */
    private String coverImage;
}
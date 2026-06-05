package com.music_library.admin_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.music_library.admin_service.entity.Song;
import com.music_library.admin_service.service.SongService;

/**
 * REST Controller for managing Song resources in the Music Library.
 * Provides CRUD operations for songs including create, read, update, and delete.
 * All endpoints are exposed under the /songs base path.
 * 
 * This controller handles:
 * - Adding new songs to the library
 * - Retrieving all songs or a specific song by ID
 * - Updating existing song information
 * - Deleting songs from the library
 * - Automatically creates artist entries when songs are added
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@RestController
@RequestMapping("/songs")
@CrossOrigin(origins = "*")
public class SongController {

    @Autowired
    private SongService songService;

    /**
     * Adds a new song to the music library.
     * Also automatically creates an artist entry if it doesn't exist.
     * 
     * @param song the Song entity containing all song details (name, artist, album, etc.)
     * @return the created Song entity with generated ID
     */
    @PostMapping
    public Song addSong(@RequestBody Song song) {
        return songService.addSong(song);
    }

    /**
     * Retrieves all songs from the music library.
     * 
     * @return List of all Song entities in the database
     */
    @GetMapping
    public List<Song> getAllSongs() {
        return songService.getAllSongs();
    }

    /**
     * Retrieves a specific song by its ID.
     * 
     * @param id the unique identifier of the song
     * @return the Song entity if found, null otherwise
     */
    @GetMapping("/{id}")
    public Song getSong(@PathVariable Long id) {
        return songService.getSongById(id);
    }

    /**
     * Deletes a song from the music library.
     * 
     * @param id the unique identifier of the song to delete
     * @return success message confirming deletion
     */
    @DeleteMapping("/{id}")
    public String deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return "Song deleted successfully";
    }

    /**
     * Updates an existing song's information.
     * Also updates associated artist entries if artist name is changed.
     * 
     * @param id the unique identifier of the song to update
     * @param song the Song entity with updated information
     * @return ResponseEntity with updated Song if found, 404 NOT FOUND otherwise
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSong(@PathVariable Long id, @RequestBody Song song) {
        Song updated = songService.updateSong(id, song);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
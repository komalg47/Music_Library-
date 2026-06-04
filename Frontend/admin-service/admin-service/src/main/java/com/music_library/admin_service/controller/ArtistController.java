package com.music_library.admin_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.music_library.admin_service.entity.Artist;
import com.music_library.admin_service.service.ArtistService;

/**
 * REST Controller for managing Artist resources in the Music Library.
 * Provides CRUD operations for artists including create, read, update, and delete.
 * All endpoints are exposed under the /artists base path.
 * 
 * This controller handles:
 * - Adding new artists manually or automatically when songs are added
 * - Retrieving all artists in the library
 * - Updating artist information
 * - Deleting artists from the library
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@RestController
@RequestMapping("/artists")
@CrossOrigin(origins = "*")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    /**
     * Adds a new artist to the music library.
     * 
     * @param artist the Artist entity containing artist name and details
     * @return the created Artist entity with generated ID
     */
    @PostMapping
    public Artist addArtist(@RequestBody Artist artist) {
        return artistService.addArtist(artist);
    }

    /**
     * Retrieves all artists from the music library.
     * Used by both user and admin dashboards to display artist lists.
     * 
     * @return List of all Artist entities in the database
     */
    @GetMapping
    public List<Artist> getAllArtists() {
        return artistService.getAllArtists();
    }

    /**
     * Deletes an artist from the music library.
     * Note: Does not cascade delete songs by this artist.
     * 
     * @param id the unique identifier of the artist to delete
     * @return success message confirming deletion
     */
    @DeleteMapping("/{id}")
    public String deleteArtist(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return "Artist deleted successfully";
    }

    /**
     * Updates an existing artist's information.
     * 
     * @param id the unique identifier of the artist to update
     * @param artist the Artist entity with updated information
     * @return ResponseEntity with updated Artist if found, 404 NOT FOUND otherwise
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateArtist(@PathVariable Long id, @RequestBody Artist artist) {
        Artist updated = artistService.updateArtist(id, artist);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
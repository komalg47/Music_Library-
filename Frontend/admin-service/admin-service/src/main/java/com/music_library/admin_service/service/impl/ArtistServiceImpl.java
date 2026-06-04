package com.music_library.admin_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.music_library.admin_service.entity.Artist;
import com.music_library.admin_service.repository.ArtistRepository;
import com.music_library.admin_service.service.ArtistService;

/**
 * Service implementation for Artist-related business logic.
 * Implements the ArtistService interface and handles all artist operations.
 * 
 * Key Features:
 * - CRUD operations for artists
 * - Find or create artist functionality (prevents duplicates)
 * - Case-insensitive artist name matching
 * - Automatic artist creation when songs are added
 * 
 * This service is critical for maintaining artist data consistency
 * across the application. It ensures no duplicate artists are created
 * even when songs reference the same artist with different case variations.
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Service
public class ArtistServiceImpl implements ArtistService {

    @Autowired
    private ArtistRepository artistRepository;

    /**
     * Adds a new artist to the database.
     * 
     * @param artist the Artist entity to be added
     * @return the saved Artist entity with generated ID
     */
    @Override
    public Artist addArtist(Artist artist) {
        return artistRepository.save(artist);
    }

    /**
     * Retrieves all artists from the database.
     * Used by dashboards to display artist lists and counts.
     * 
     * @return List of all Artist entities
     */
    @Override
    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    /**
     * Deletes an artist from the database.
     * Note: Does not cascade delete songs by this artist.
     * 
     * @param id the unique identifier of the artist to delete
     */
    @Override
    public void deleteArtist(Long id) {
        artistRepository.deleteById(id);
    }

    /**
     * Updates an existing artist's information.
     * 
     * @param id the unique identifier of the artist to update
     * @param updated the Artist entity containing updated information
     * @return the updated Artist entity if found, null otherwise
     */
    @Override
    public Artist updateArtist(Long id, Artist updated) {
        Artist existing = artistRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        existing.setArtistName(updated.getArtistName());
        return artistRepository.save(existing);
    }

    /**
     * Finds an existing artist by name or creates a new one if not found.
     * This method prevents duplicate artist entries by performing case-insensitive search.
     * 
     * The method is called automatically when:
     * - Songs are added with new artist names
     * - Songs are updated with different artist names
     * - Music director information is provided in songs
     * 
     * @param artistName the name of the artist to find or create
     * @return the existing or newly created Artist entity, null if artistName is empty
     */
    @Override
    public Artist findOrCreateArtist(String artistName) {
        // Validate input
        if (artistName == null || artistName.trim().isEmpty()) {
            return null;
        }
        
        String trimmedName = artistName.trim();
        
        // Try to find existing artist (case-insensitive)
        return artistRepository.findByArtistNameIgnoreCase(trimmedName)
            .orElseGet(() -> {
                // Create new artist if not found
                Artist newArtist = new Artist();
                newArtist.setArtistName(trimmedName);
                return artistRepository.save(newArtist);
            });
    }
}
package com.music_library.admin_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.music_library.admin_service.entity.Song;
import com.music_library.admin_service.repository.SongRepository;
import com.music_library.admin_service.service.ArtistService;
import com.music_library.admin_service.service.SongService;

/**
 * Service implementation for Song-related business logic.
 * Implements the SongService interface and handles all song operations.
 * 
 * Key Features:
 * - CRUD operations for songs
 * - Automatic artist creation when songs are added/updated
 * - Validates and processes song data before persistence
 * - Integrates with ArtistService for artist management
 * 
 * This service ensures that whenever a song is created or updated,
 * the corresponding artist entry exists in the artists table.
 * 
 * @author MusicVerse Team
 * @version 1.0
 * @since 2024
 */
@Service
public class SongServiceImpl implements SongService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private ArtistService artistService;

    /**
     * Adds a new song to the database.
     * Automatically creates artist and music director entries if they don't exist.
     * 
     * @param song the Song entity to be added
     * @return the saved Song entity with generated ID
     */
    @Override
    public Song addSong(Song song) {
        // Automatically create artist if it doesn't exist
        if (song.getArtist() != null && !song.getArtist().trim().isEmpty()) {
            artistService.findOrCreateArtist(song.getArtist());
        }
        
        // Also create artist for music director if provided
        if (song.getMusicDirector() != null && !song.getMusicDirector().trim().isEmpty()) {
            artistService.findOrCreateArtist(song.getMusicDirector());
        }
        
        return songRepository.save(song);
    }

    /**
     * Retrieves all songs from the database.
     * 
     * @return List of all Song entities
     */
    @Override
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    /**
     * Retrieves a specific song by its ID.
     * 
     * @param id the unique identifier of the song
     * @return the Song entity if found, null otherwise
     */
    @Override
    public Song getSongById(Long id) {
        return songRepository.findById(id).orElse(null);
    }

    /**
     * Deletes a song from the database.
     * Note: Does not delete the associated artist entry.
     * 
     * @param id the unique identifier of the song to delete
     */
    @Override
    public void deleteSong(Long id) {
        songRepository.deleteById(id);
    }

    /**
     * Updates an existing song with new information.
     * Automatically creates/updates artist entries if artist name is changed.
     * 
     * @param id the unique identifier of the song to update
     * @param updatedSong the Song entity containing updated information
     * @return the updated Song entity if found, null otherwise
     */
    @Override
    public Song updateSong(Long id, Song updatedSong) {
        // Find existing song
        Song existing = songRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        
        // Update all fields
        existing.setSongName(updatedSong.getSongName());
        existing.setArtist(updatedSong.getArtist());
        existing.setAlbum(updatedSong.getAlbum());
        existing.setMusicDirector(updatedSong.getMusicDirector());
        existing.setReleaseDate(updatedSong.getReleaseDate());
        existing.setVisible(updatedSong.isVisible());
        existing.setCoverImage(updatedSong.getCoverImage());
        
        // Automatically create artist if it doesn't exist
        if (existing.getArtist() != null && !existing.getArtist().trim().isEmpty()) {
            artistService.findOrCreateArtist(existing.getArtist());
        }
        
        // Also create artist for music director if provided
        if (existing.getMusicDirector() != null && !existing.getMusicDirector().trim().isEmpty()) {
            artistService.findOrCreateArtist(existing.getMusicDirector());
        }
        
        return songRepository.save(existing);
    }
}
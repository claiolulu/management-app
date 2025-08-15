package com.figma.webapp.controller;

import com.figma.webapp.dto.InteractionDto;
import com.figma.webapp.service.InteractionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class InteractionController {

    @Autowired
    private InteractionService interactionService;

    @GetMapping
    public ResponseEntity<List<InteractionDto>> getRecentInteractions(@RequestParam(defaultValue = "50") int limit) {
        List<InteractionDto> interactions = interactionService.getRecentInteractions(limit);
        return ResponseEntity.ok(interactions);
    }

    @PostMapping
    public ResponseEntity<InteractionDto> createInteraction(@Valid @RequestBody InteractionDto interactionDto) {
        InteractionDto createdInteraction = interactionService.createInteraction(interactionDto);
        return new ResponseEntity<>(createdInteraction, HttpStatus.CREATED);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<InteractionDto>> getInteractionsByType(@PathVariable String type) {
        List<InteractionDto> interactions = interactionService.getInteractionsByType(type);
        return ResponseEntity.ok(interactions);
    }
}
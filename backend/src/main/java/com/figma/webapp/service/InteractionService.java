package com.figma.webapp.service;

import com.figma.webapp.dto.InteractionDto;
import com.figma.webapp.entity.Interaction;
import com.figma.webapp.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InteractionService {

    @Autowired
    private InteractionRepository interactionRepository;

    public List<InteractionDto> getRecentInteractions(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return interactionRepository.findByOrderByTimestampDesc(pageable).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InteractionDto> getInteractionsByType(String type) {
        return interactionRepository.findByTypeOrderByTimestampDesc(type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InteractionDto createInteraction(InteractionDto interactionDto) {
        Interaction interaction = convertToEntity(interactionDto);
        Interaction savedInteraction = interactionRepository.save(interaction);
        return convertToDto(savedInteraction);
    }

    public long getTotalInteractions() {
        return interactionRepository.count();
    }

    public long getInteractionCountByType(String type) {
        return interactionRepository.countByType(type);
    }

    private InteractionDto convertToDto(Interaction interaction) {
        InteractionDto dto = new InteractionDto();
        dto.setId(interaction.getId());
        dto.setType(interaction.getType());
        dto.setElement(interaction.getElement());
        dto.setPosition(interaction.getPosition());
        dto.setTimestamp(interaction.getTimestamp());
        return dto;
    }

    private Interaction convertToEntity(InteractionDto dto) {
        Interaction interaction = new Interaction();
        interaction.setType(dto.getType());
        interaction.setElement(dto.getElement());
        interaction.setPosition(dto.getPosition());
        return interaction;
    }
}
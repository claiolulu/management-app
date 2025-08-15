package com.figma.webapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.figma.webapp.dto.EventDto;
import com.figma.webapp.entity.Event;
import com.figma.webapp.repository.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<EventDto> getAllEvents() {
        return eventRepository.findByOrderByDateAscCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsByDate(LocalDate date) {
        return eventRepository.findByDateOrderByCreatedAtDesc(date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public EventDto createEvent(EventDto eventDto) {
        Event event = convertToEntity(eventDto);
        Event savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    public Optional<EventDto> updateEvent(Long id, EventDto eventDto) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    if (eventDto.getTitle() != null) {
                        existingEvent.setTitle(eventDto.getTitle());
                    }
                    if (eventDto.getDate() != null) {
                        existingEvent.setDate(eventDto.getDate());
                    }
                    if (eventDto.getTime() != null) {
                        existingEvent.setTime(eventDto.getTime());
                    }
                    if (eventDto.getDescription() != null) {
                        existingEvent.setDescription(eventDto.getDescription());
                    }
                    return convertToDto(eventRepository.save(existingEvent));
                });
    }

    public boolean deleteEvent(Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<EventDto> searchEvents(String query) {
        return eventRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private EventDto convertToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setDate(event.getDate());
        dto.setTitle(event.getTitle());
        dto.setTime(event.getTime());
        dto.setDescription(event.getDescription());
        return dto;
    }

    private Event convertToEntity(EventDto dto) {
        Event event = new Event();
        event.setDate(dto.getDate());
        event.setTitle(dto.getTitle());
        event.setTime(dto.getTime());
        event.setDescription(dto.getDescription());
        return event;
    }
}
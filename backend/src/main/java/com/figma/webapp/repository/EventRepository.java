package com.figma.webapp.repository;

import com.figma.webapp.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByDateOrderByCreatedAtDesc(LocalDate date);
    
    List<Event> findByOrderByDateAscCreatedAtDesc();
    
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(@Param("query") String query);
}
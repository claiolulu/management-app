package com.figma.webapp.repository;

import com.figma.webapp.entity.Interaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    
    List<Interaction> findByOrderByTimestampDesc(Pageable pageable);
    
    List<Interaction> findByTypeOrderByTimestampDesc(String type);
    
    long countByType(String type);
}
package com.internship.userservice.repository;

import com.internship.userservice.entity.SkillMaster;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillMasterRepository extends JpaRepository<SkillMaster, Long> {

    @Query("SELECT s FROM SkillMaster s WHERE LOWER(TRIM(s.skillName)) = LOWER(TRIM(:skillName))")
    Optional<SkillMaster> findBySkillNameIgnoreCaseTrimmed(String skillName);

    List<SkillMaster> findBySkillNameContainingIgnoreCase(String keyword);

    Page<SkillMaster> findBySkillNameContainingIgnoreCase(String keyword, Pageable pageable);

    List<SkillMaster> findByCategoryIgnoreCase(String category);
}

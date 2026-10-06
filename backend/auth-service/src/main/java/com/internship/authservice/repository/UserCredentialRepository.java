package com.internship.authservice.repository;

import com.internship.authservice.entity.ApprovalStatus;
import com.internship.authservice.entity.Role;
import com.internship.authservice.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {
    Optional<UserCredential> findByEmail(String email);
    Optional<UserCredential> findByEmailIgnoreCase(String email);
    
    @Query("SELECT u FROM UserCredential u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    Optional<UserCredential> findByEmailIgnoreCaseTrimmed(@Param("email") String email);

    List<UserCredential> findByRoleAndApprovalStatus(Role role, ApprovalStatus approvalStatus);
}

package com.internship.authservice.config;

import com.internship.authservice.entity.ApprovalStatus;
import com.internship.authservice.entity.Role;
import com.internship.authservice.entity.UserCredential;
import com.internship.authservice.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserCredentialRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null || username.isBlank()) {
            throw new UsernameNotFoundException("Email address is required");
        }
        
        String normalizedEmail = normalizeEmail(username);
        Optional<UserCredential> credential = repository.findByEmailIgnoreCaseTrimmed(normalizedEmail);
        
        if (credential.isEmpty()) {
            throw new UsernameNotFoundException("No account found with email: " + normalizedEmail);
        }
        
        UserCredential user = credential.get();
        
        // Check if admin account is pending approval
        if (user.getRole() == Role.ADMIN && user.getApprovalStatus() == ApprovalStatus.PENDING) {
            throw new DisabledException("Admin account pending approval from Super Admin");
        }
        
        // Check if admin account was rejected
        if (user.getRole() == Role.ADMIN && user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new DisabledException("Admin account has been rejected. Please contact Super Admin");
        }
        
        return new CustomUserDetails(user);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }
}

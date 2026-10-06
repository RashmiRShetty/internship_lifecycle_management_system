package com.internship.authservice.config;

import com.internship.authservice.entity.ApprovalStatus;
import com.internship.authservice.entity.Role;
import com.internship.authservice.entity.UserCredential;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private String username;
    private String password;
    private List<GrantedAuthority> authorities;
    private ApprovalStatus approvalStatus;
    private Role role;

    public CustomUserDetails(UserCredential userCredential) {
        this.username = userCredential.getEmail();
        this.password = userCredential.getPassword();
        this.authorities = List.of(new SimpleGrantedAuthority(userCredential.getRole().name()));
        this.approvalStatus = userCredential.getApprovalStatus();
        this.role = userCredential.getRole();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // ADMIN users must be approved to login
        if (role == Role.ADMIN) {
            return approvalStatus == ApprovalStatus.APPROVED;
        }
        return true;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public Role getRole() {
        return role;
    }
}

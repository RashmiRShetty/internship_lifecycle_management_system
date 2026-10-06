package com.internship.userservice.repository;

import com.internship.userservice.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmail(String email);
    Optional<Faculty> findByDepartmentAndRole(String department, String role);
    Optional<Faculty> findByEmployeeId(String employeeId);
    List<Faculty> findByDepartment(String department);
}

package com.internship.userservice.service;

import com.internship.userservice.entity.Department;
import com.internship.userservice.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findByIsActiveTrue();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Optional<Department> getDepartmentByName(String name) {
        return departmentRepository.findByName(name);
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new RuntimeException("Department with name '" + department.getName() + "' already exists");
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        if (!department.getName().equals(departmentDetails.getName()) && 
            departmentRepository.existsByName(departmentDetails.getName())) {
            throw new RuntimeException("Department with name '" + departmentDetails.getName() + "' already exists");
        }

        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());
        department.setIsActive(departmentDetails.getIsActive());

        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        department.setIsActive(false);
        departmentRepository.save(department);
    }
}
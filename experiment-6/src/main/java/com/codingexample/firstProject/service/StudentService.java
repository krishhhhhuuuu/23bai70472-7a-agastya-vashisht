package com.codingexample.firstProject.service;

import com.codingexample.firstProject.dto.StudentRequest;
import com.codingexample.firstProject.dto.StudentResponse;
import java.util.List;

public interface StudentService {

    StudentResponse create(StudentRequest request);

    List<StudentResponse> getAll();

    StudentResponse getById(Long id);

    StudentResponse update(Long id, StudentRequest request);

    void delete(Long id);
}
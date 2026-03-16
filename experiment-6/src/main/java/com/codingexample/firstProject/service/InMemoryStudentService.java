package com.codingexample.firstProject.service;

import com.codingexample.firstProject.dto.StudentRequest;
import com.codingexample.firstProject.dto.StudentResponse;
import com.codingexample.firstProject.exception.ResourceNotFoundException;
import com.codingexample.firstProject.model.Student;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InMemoryStudentService implements StudentService {

    private final Map<Long, Student> students = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong();

    @Override
    public StudentResponse create(StudentRequest request) {

        Long id = idGenerator.incrementAndGet();

        Student student = new Student(
                id,
                request.getName(),
                request.getEmail(),
                request.getAge()
        );

        students.put(id, student);

        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getAge()
        );
    }

    @Override
    public List<StudentResponse> getAll() {

        List<StudentResponse> list = new ArrayList<>();

        for (Student s : students.values()) {
            list.add(new StudentResponse(
                    s.getId(),
                    s.getName(),
                    s.getEmail(),
                    s.getAge()
            ));
        }

        return list;
    }

    @Override
    public StudentResponse getById(Long id) {

        Student student = students.get(id);

        if (student == null) {
            throw new ResourceNotFoundException("Student not found");
        }

        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getAge()
        );
    }

    @Override
    public StudentResponse update(Long id, StudentRequest request) {

        Student student = students.get(id);

        if (student == null) {
            throw new ResourceNotFoundException("Student not found");
        }

        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setAge(request.getAge());

        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getAge()
        );
    }

    @Override
    public void delete(Long id) {

        if (!students.containsKey(id)) {
            throw new ResourceNotFoundException("Student not found");
        }

        students.remove(id);
    }
}
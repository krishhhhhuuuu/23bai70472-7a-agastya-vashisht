package com.example.experiment7;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import com.example.experiment7.entity.User;
import com.example.experiment7.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class Experiment7Application {

	public static void main(String[] args) {
		SpringApplication.run(Experiment7Application.class, args);
	}

	// ⭐ THIS MUST BE INSIDE CLASS
	@Bean
	public CommandLineRunner runner(UserRepository repo, PasswordEncoder encoder) {
		return args -> {

			User user = new User();
			user.setUsername("user1");
			user.setPassword(encoder.encode("password")); // correct encoding
			user.setRole("USER");

			User admin = new User();
			admin.setUsername("admin1");
			admin.setPassword(encoder.encode("password"));
			admin.setRole("ADMIN");

			repo.save(user);
			repo.save(admin);
		};
	}
}
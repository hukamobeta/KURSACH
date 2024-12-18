package com.example.KURSACH;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.KURSACH")
public class KursachApplication {

	public static void main(String[] args) {
		SpringApplication.run(KursachApplication.class, args);
	}

}

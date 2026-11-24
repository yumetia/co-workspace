package com.coworkspace;

import org.springframework.boot.SpringApplication;

public class TestCoworkspaceApplication {

	public static void main(String[] args) {
		SpringApplication.from(CoworkspaceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}

package com.coworkspace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CoworkspaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoworkspaceApplication.class, args);
    }
}

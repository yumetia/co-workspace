package com.coworkspace;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class CoworkspaceApplicationTests {

    @Test
    void contextLoads() {
        // Vérifie que l'application démarre : configuration, migrations Flyway et sécurité.
    }
}

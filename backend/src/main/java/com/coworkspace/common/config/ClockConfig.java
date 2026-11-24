package com.coworkspace.common.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Horloge injectable : les services n'appellent jamais Instant.now() directement,
 * ce qui permet de figer le temps dans les tests.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}

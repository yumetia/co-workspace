package com.coworkspace.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Active l'envoi asynchrone des emails et les tâches planifiées (rappels). */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}

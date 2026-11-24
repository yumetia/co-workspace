package com.coworkspace.common.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.time.ZoneId;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration propre à l'application (préfixe {@code app} dans application.yml).
 * Validée au démarrage : l'API refuse de démarrer si une valeur obligatoire manque.
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @NotBlank String frontendUrl,
        @NotBlank String mailFrom,
        @NotBlank String timezone,
        @Valid @NotNull Jwt jwt) {

    public record Jwt(
            @NotBlank(message = "JWT_SECRET doit être défini (voir .env.example)")
            @Size(min = 32, message = "JWT_SECRET doit contenir au moins 32 caractères")
            String secret,
            @NotNull Duration expiration) {
    }

    public ZoneId zoneId() {
        return ZoneId.of(timezone);
    }
}

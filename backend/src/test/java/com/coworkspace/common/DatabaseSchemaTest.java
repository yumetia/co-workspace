package com.coworkspace.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.coworkspace.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/** Vérifie les migrations Flyway et la garantie anti-double-réservation au niveau de la base. */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@Transactional
class DatabaseSchemaTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void referenceDataContainsFiftyDesksAndFourMeetingRooms() {
        Integer desks = jdbc.queryForObject("SELECT count(*) FROM spaces WHERE type = 'DESK'", Integer.class);
        Integer rooms = jdbc.queryForObject("SELECT count(*) FROM spaces WHERE type = 'MEETING_ROOM'", Integer.class);

        assertThat(desks).isEqualTo(50);
        assertThat(rooms).isEqualTo(4);
    }

    @Test
    void overlappingConfirmedReservationsOnSameSpaceAreRejected() {
        long userId = insertUser();
        long spaceId = firstSpaceId();
        insertReservation(userId, spaceId, "2030-01-07 09:00+01", "2030-01-07 11:00+01", "CONFIRMED");

        assertThatThrownBy(() ->
                insertReservation(userId, spaceId, "2030-01-07 10:00+01", "2030-01-07 12:00+01", "CONFIRMED"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void adjacentOrCancelledReservationsDoNotConflict() {
        long userId = insertUser();
        long spaceId = firstSpaceId();
        insertReservation(userId, spaceId, "2030-01-07 09:00+01", "2030-01-07 11:00+01", "CONFIRMED");

        // Créneau qui commence exactement à la fin du précédent : autorisé
        insertReservation(userId, spaceId, "2030-01-07 11:00+01", "2030-01-07 12:00+01", "CONFIRMED");
        // Réservation annulée sur un créneau déjà pris : autorisée
        insertReservation(userId, spaceId, "2030-01-07 09:30+01", "2030-01-07 10:30+01", "CANCELLED");

        Integer count = jdbc.queryForObject("SELECT count(*) FROM reservations WHERE space_id = ?", Integer.class, spaceId);
        assertThat(count).isEqualTo(3);
    }

    private long insertUser() {
        return jdbc.queryForObject("""
                INSERT INTO users (email, password_hash, first_name, last_name, status)
                VALUES ('schema-test@example.com', 'hash', 'Test', 'Schema', 'ACTIVE') RETURNING id
                """, Long.class);
    }

    private long firstSpaceId() {
        return jdbc.queryForObject("SELECT min(id) FROM spaces", Long.class);
    }

    private void insertReservation(long userId, long spaceId, String start, String end, String status) {
        jdbc.update("""
                INSERT INTO reservations (user_id, space_id, title, start_at, end_at, status)
                VALUES (?, ?, 'Test', ?::timestamptz, ?::timestamptz, ?)
                """, userId, spaceId, start, end, status);
    }
}

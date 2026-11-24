-- =====================================================================
-- CoWork'Space : schéma initial
-- Toutes les dates/heures sont stockées en TIMESTAMPTZ (UTC).
-- =====================================================================

-- Nécessaire pour la contrainte d'exclusion anti-chevauchement (=, && dans un même index GiST)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------
-- Membres et administrateurs
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    photo_path    VARCHAR(255),
    role          VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING_EMAIL',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('MEMBER', 'ADMIN')),
    CONSTRAINT ck_users_status CHECK (status IN ('PENDING_EMAIL', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE'))
);

-- Jetons à usage unique envoyés par email (seul le hash SHA-256 est stocké)
CREATE TABLE user_tokens (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    type       VARCHAR(30) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_user_tokens_hash UNIQUE (token_hash),
    CONSTRAINT ck_user_tokens_type CHECK (type IN ('EMAIL_VERIFICATION', 'PASSWORD_RESET'))
);
CREATE INDEX ix_user_tokens_user ON user_tokens (user_id);

-- ---------------------------------------------------------------------
-- Espaces (postes en open space et salles de réunion) et équipements
-- plan_x / plan_y / plan_w / plan_h : position sur le plan SVG (viewBox 1200 x 700)
-- ---------------------------------------------------------------------
CREATE TABLE spaces (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(20)  NOT NULL,
    capacity    INTEGER      NOT NULL,
    description TEXT,
    plan_x      INTEGER      NOT NULL,
    plan_y      INTEGER      NOT NULL,
    plan_w      INTEGER      NOT NULL,
    plan_h      INTEGER      NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_spaces_name UNIQUE (name),
    CONSTRAINT ck_spaces_type CHECK (type IN ('DESK', 'MEETING_ROOM')),
    CONSTRAINT ck_spaces_capacity CHECK (capacity > 0),
    CONSTRAINT ck_spaces_plan CHECK (plan_w > 0 AND plan_h > 0)
);

CREATE TABLE equipments (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    CONSTRAINT uk_equipments_name UNIQUE (name)
);

CREATE TABLE space_equipments (
    space_id     BIGINT NOT NULL REFERENCES spaces (id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipments (id) ON DELETE CASCADE,
    PRIMARY KEY (space_id, equipment_id)
);

-- ---------------------------------------------------------------------
-- Réservations
-- ---------------------------------------------------------------------
-- Série de réservations récurrentes (ex. tous les mardis de 9h à 12h)
CREATE TABLE reservation_series (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id),
    space_id    BIGINT      NOT NULL REFERENCES spaces (id),
    day_of_week SMALLINT    NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    start_date  DATE        NOT NULL,
    end_date    DATE        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_series_day CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT ck_series_time CHECK (end_time > start_time),
    CONSTRAINT ck_series_dates CHECK (end_date >= start_date)
);

CREATE TABLE reservations (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT       NOT NULL REFERENCES users (id),
    space_id         BIGINT       NOT NULL REFERENCES spaces (id),
    series_id        BIGINT       REFERENCES reservation_series (id) ON DELETE SET NULL,
    title            VARCHAR(120) NOT NULL,
    visibility       VARCHAR(10)  NOT NULL DEFAULT 'PRIVATE',
    start_at         TIMESTAMPTZ  NOT NULL,
    end_at           TIMESTAMPTZ  NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMED',
    cancelled_at     TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservations_period CHECK (end_at > start_at),
    CONSTRAINT ck_reservations_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    CONSTRAINT ck_reservations_status CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    -- Garantie absolue contre les doubles réservations :
    -- deux réservations confirmées d'un même espace ne peuvent pas se chevaucher.
    CONSTRAINT ex_reservations_no_overlap EXCLUDE USING gist (
        space_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
    ) WHERE (status = 'CONFIRMED')
);
CREATE INDEX ix_reservations_user_start ON reservations (user_id, start_at);
CREATE INDEX ix_reservations_start ON reservations (start_at);
CREATE INDEX ix_reservations_series ON reservations (series_id);

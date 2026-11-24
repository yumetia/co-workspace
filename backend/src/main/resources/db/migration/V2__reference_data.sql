-- =====================================================================
-- Données de référence : équipements, 50 postes et 4 salles de réunion.
-- Les coordonnées correspondent au plan SVG (viewBox 0 0 1200 700).
-- =====================================================================

INSERT INTO equipments (name, icon) VALUES
    ('Prise électrique', 'plug'),
    ('Écran externe', 'monitor'),
    ('Station d''accueil', 'dock'),
    ('Vidéoprojecteur', 'projector'),
    ('Écran TV', 'tv'),
    ('Tableau blanc', 'whiteboard'),
    ('Visioconférence', 'video'),
    ('Paperboard', 'paperboard');

-- Open space : 5 îlots (A à E) de 10 postes (2 rangées de 5 postes face à face)
INSERT INTO spaces (name, type, capacity, description, plan_x, plan_y, plan_w, plan_h)
SELECT 'Poste ' || i.island || (r * 5 + c + 1),
       'DESK',
       1,
       'Poste individuel de l''îlot ' || i.island,
       i.ox + c * 64,
       i.oy + r * 46,
       60,
       42
FROM (VALUES ('A', 60, 80), ('B', 440, 80), ('C', 60, 270), ('D', 440, 270), ('E', 60, 460)) AS i (island, ox, oy)
CROSS JOIN generate_series(0, 1) AS r
CROSS JOIN generate_series(0, 4) AS c
ORDER BY i.island, r, c;

-- Salles de réunion (colonne de droite)
INSERT INTO spaces (name, type, capacity, description, plan_x, plan_y, plan_w, plan_h) VALUES
    ('Salle Atlas',   'MEETING_ROOM', 4,  'Petite salle pour les points rapides et les appels.', 860, 40,  300, 140),
    ('Salle Horizon', 'MEETING_ROOM', 6,  'Salle lumineuse pour les réunions d''équipe.',        860, 190, 300, 140),
    ('Salle Odyssée', 'MEETING_ROOM', 8,  'Salle équipée pour les ateliers et la visio.',         860, 340, 300, 150),
    ('Salle Zénith',  'MEETING_ROOM', 12, 'Grande salle pour les présentations et formations.',   860, 500, 300, 160);

-- Tous les postes ont une prise électrique
INSERT INTO space_equipments (space_id, equipment_id)
SELECT s.id, e.id FROM spaces s, equipments e
WHERE s.type = 'DESK' AND e.name = 'Prise électrique';

-- Îlots A et B : écran externe ; îlot A : station d'accueil
INSERT INTO space_equipments (space_id, equipment_id)
SELECT s.id, e.id FROM spaces s, equipments e
WHERE s.type = 'DESK' AND e.name = 'Écran externe'
  AND (s.name LIKE 'Poste A%' OR s.name LIKE 'Poste B%');

INSERT INTO space_equipments (space_id, equipment_id)
SELECT s.id, e.id FROM spaces s, equipments e
WHERE s.type = 'DESK' AND e.name = 'Station d''accueil' AND s.name LIKE 'Poste A%';

-- Équipements des salles
INSERT INTO space_equipments (space_id, equipment_id)
SELECT s.id, e.id
FROM (VALUES
        ('Salle Atlas', 'Écran TV'),
        ('Salle Atlas', 'Tableau blanc'),
        ('Salle Horizon', 'Écran TV'),
        ('Salle Horizon', 'Tableau blanc'),
        ('Salle Horizon', 'Visioconférence'),
        ('Salle Odyssée', 'Vidéoprojecteur'),
        ('Salle Odyssée', 'Tableau blanc'),
        ('Salle Odyssée', 'Visioconférence'),
        ('Salle Odyssée', 'Paperboard'),
        ('Salle Zénith', 'Vidéoprojecteur'),
        ('Salle Zénith', 'Écran TV'),
        ('Salle Zénith', 'Visioconférence'),
        ('Salle Zénith', 'Paperboard')
     ) AS m (space_name, equipment_name)
JOIN spaces s ON s.name = m.space_name
JOIN equipments e ON e.name = m.equipment_name;

CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Genre_category_name_key" ON "Genre"("category", "name");

INSERT INTO "Genre" ("id", "category", "name") VALUES
    ('screen_accion', 'SCREEN', 'accion'),
    ('screen_comedia', 'SCREEN', 'comedia'),
    ('screen_romance', 'SCREEN', 'romance'),
    ('screen_scifi', 'SCREEN', 'sci-fi'),
    ('screen_superheroes', 'SCREEN', 'superheroes'),
    ('screen_drama', 'SCREEN', 'drama'),
    ('screen_terror', 'SCREEN', 'terror'),
    ('screen_suspenso', 'SCREEN', 'suspenso'),
    ('screen_aventura', 'SCREEN', 'aventura'),
    ('screen_musical', 'SCREEN', 'musical'),
    ('screen_fantasia', 'SCREEN', 'fantasia'),
    ('screen_zombies', 'SCREEN', 'zombies'),
    ('screen_videojuegos', 'SCREEN', 'videojuegos'),
    ('screen_familiar', 'SCREEN', 'familiar'),
    ('screen_deporte', 'SCREEN', 'deporte'),
    ('screen_timetravel', 'SCREEN', 'time travel'),
    ('screen_vidareal', 'SCREEN', 'vida real'),
    ('screen_policial', 'SCREEN', 'policial'),
    ('screen_cocina', 'SCREEN', 'cocina'),
    ('screen_western', 'SCREEN', 'western'),
    ('game_shooter', 'GAME', 'shooter'),
    ('game_aventura', 'GAME', 'aventura'),
    ('game_rpg', 'GAME', 'RPG'),
    ('game_estrategia', 'GAME', 'estrategia'),
    ('game_deportes', 'GAME', 'deportes'),
    ('game_zombies', 'GAME', 'zombies'),
    ('game_soulslike', 'GAME', 'soulslike'),
    ('game_battleroyal', 'GAME', 'battle royal'),
    ('game_lucha', 'GAME', 'lucha'),
    ('game_terror', 'GAME', 'terror'),
    ('game_tdd', 'GAME', 'tdd'),
    ('game_turnos', 'GAME', 'turnos'),
    ('game_survival', 'GAME', 'survival'),
    ('game_towerdefense', 'GAME', 'tower defense'),
    ('game_extractionshooter', 'GAME', 'extraction shooter'),
    ('game_futurista', 'GAME', 'futurista'),
    ('game_simulacion', 'GAME', 'simulacion');

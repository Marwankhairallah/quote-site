import sqlite3

# Connexion à la base de données (crée le fichier s'il n'existe pas)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Supprimer les anciennes tables (pour une nouvelle création complète)
cursor.execute('DROP TABLE IF EXISTS Notes')
cursor.execute('DROP TABLE IF EXISTS Citations')

# Créer la table "Citations" avec une colonne "category"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Citations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texte TEXT NOT NULL,
    auteur TEXT,
    category TEXT NOT NULL, -- Nouvelle colonne pour les catégories
    last_used_date TEXT
)
''')

# Créer la table "Notes"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation_id INTEGER NOT NULL,
    note INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (citation_id) REFERENCES Citations (id),
    UNIQUE (citation_id, user_id) -- Empêcher les votes multiples pour une citation
)
''')

# Insérer quelques citations initiales avec des catégories
cursor.execute('''
INSERT INTO Citations (texte, auteur, category) VALUES
("La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", "Gandhi", "Motivation"),
("L'éducation est l'arme la plus puissante pour changer le monde.", "Nelson Mandela", "Inspiration"),
("Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.", "Albert Schweitzer", "Motivation"),
("La plus grande gloire n'est pas de ne jamais tomber, mais de se relever à chaque chute.", "Confucius", "Résilience")
''')

# Créer la table "Comments"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citation_id) REFERENCES Citations (id)
)
''')

print("Base de données initialisée avec succès !")

# Sauvegarder et fermer
conn.commit()
conn.close()

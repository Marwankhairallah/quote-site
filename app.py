from flask import Flask, jsonify, request, render_template
import sqlite3
import datetime

app = Flask(__name__)

# Route pour afficher la page HTML principale
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/quote', methods=['GET'])
def get_quote():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Obtenir la date du jour
    today = datetime.date.today().isoformat()

    # Vérifier si une citation a déjà été utilisée aujourd'hui
    cursor.execute('SELECT id, texte, auteur, category FROM Citations WHERE last_used_date = ?', (today,))
    quote = cursor.fetchone()

    if not quote:
        # Si aucune citation n'a été sélectionnée aujourd'hui, choisir une nouvelle aléatoire
        cursor.execute('SELECT id, texte, auteur, category FROM Citations ORDER BY RANDOM() LIMIT 1')
        quote = cursor.fetchone()
        # Mettre à jour la date d'utilisation pour cette citation
        cursor.execute('UPDATE Citations SET last_used_date = ? WHERE id = ?', (today, quote[0]))
        conn.commit()

    conn.close()

    # Retourner la citation avec la catégorie
    return jsonify({"id": quote[0], "texte": quote[1], "auteur": quote[2], "category": quote[3]})


# Route pour enregistrer une note
@app.route('/rate', methods=['POST'])
def rate_quote():
    data = request.json
    citation_id = data.get('citation_id')
    note = data.get('note')
    user_id = data.get('user_id')  # Identifiant unique utilisateur

    if not (1 <= note <= 5):
        return jsonify({"message": "La note doit être entre 1 et 5"}), 400

    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        # Insérer la note avec user_id
        cursor.execute('INSERT INTO Notes (citation_id, note, user_id) VALUES (?, ?, ?)', (citation_id, note, user_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Note enregistrée avec succès !"})
    except sqlite3.IntegrityError:
        # Si l'utilisateur a déjà voté
        return jsonify({"message": "Vous avez déjà voté pour cette citation."}), 400

# Route pour récupérer la moyenne des notes
@app.route('/rating/<int:citation_id>', methods=['GET'])
def get_rating(citation_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT AVG(note) FROM Notes WHERE citation_id = ?', (citation_id,))
    result = cursor.fetchone()
    conn.close()

    average = result[0] if result[0] else 0
    return jsonify({"citation_id": citation_id, "average_rating": round(average, 2)})


@app.route('/comment', methods=['POST'])
def add_comment():
    data = request.json
    citation_id = data.get('citation_id')
    user_id = data.get('user_id')  # Identifiant unique utilisateur
    comment = data.get('comment')

    if not comment or not citation_id or not user_id:
        return jsonify({"message": "Tous les champs sont obligatoires."}), 400

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO Comments (citation_id, user_id, comment) VALUES (?, ?, ?)', (citation_id, user_id, comment))
    conn.commit()
    conn.close()

    return jsonify({"message": "Commentaire ajouté avec succès !"})


@app.route('/comments/<int:citation_id>', methods=['GET'])
def get_comments(citation_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT comment, timestamp FROM Comments WHERE citation_id = ? ORDER BY timestamp DESC', (citation_id,))
    comments = cursor.fetchall()
    conn.close()

    return jsonify([
        {"comment": row[0], "timestamp": row[1]} for row in comments
    ])

@app.route('/recent', methods=['GET'])
def get_recent_quotes():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Obtenir les 7 derniers jours
    query = '''
    SELECT texte, auteur, last_used_date
    FROM Citations
    WHERE last_used_date IS NOT NULL
    ORDER BY last_used_date DESC
    LIMIT 7
    '''
    cursor.execute(query)
    recent_quotes = cursor.fetchall()
    conn.close()

    # Formatage des résultats en JSON
    return jsonify([
        {"texte": row[0], "auteur": row[1], "date": row[2]} for row in recent_quotes
    ])


if __name__ == '__main__':
    app.run(debug=True)

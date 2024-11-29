// Générer un identifiant utilisateur unique
if (!localStorage.getItem('user_id')) {
    const userId = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', userId);
}
const userId = localStorage.getItem('user_id');

// Charger la citation
async function loadQuote() {
    const response = await fetch('/quote');
    const data = await response.json();
    document.getElementById('quote').innerText = data.texte;
    document.getElementById('author').innerText = data.auteur || "Auteur inconnu";
    document.getElementById('category').innerText = `Catégorie : ${data.category}`;
    document.getElementById('quote-section').dataset.id = data.id;
    document.getElementById('average-rating').style.display = 'none'; // Masquer la moyenne au départ
    clearMessage(); // Effacer les anciens messages
    loadComments(data.id); // Charger les commentaires pour cette citation

    // Configurer les boutons de partage
    setupShareButtons(data.texte, data.auteur || "Auteur inconnu");
}

// Charger la moyenne
async function loadRating(citationId) {
    const response = await fetch(`/rating/${citationId}`);
    const data = await response.json();
    document.getElementById('average-rating').innerText = `Note moyenne : ${data.average_rating}`;
}

// Charger les commentaires
async function loadComments(citationId) {
    const response = await fetch(`/comments/${citationId}`);
    const comments = await response.json();
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = ''; // Effacer les anciens commentaires

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.innerText = `${comment.comment} (le ${new Date(comment.timestamp).toLocaleString()})`;
        commentsList.appendChild(li);
    });
}

// Ajouter un commentaire
async function addComment() {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    const citationId = document.getElementById('quote-section').dataset.id;

    if (!commentText) {
        showMessage('error', 'Le commentaire ne peut pas être vide.');
        return;
    }

    const response = await fetch('/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citation_id: citationId, user_id: userId, comment: commentText })
    });

    const data = await response.json();

    if (response.ok) {
        showMessage('success', data.message); // Message de succès
        commentInput.value = ''; // Vider le champ de saisie
        loadComments(citationId); // Recharger les commentaires
    } else {
        showMessage('error', data.message); // Message d'erreur
    }
}

// Configurer les boutons de partage
function setupShareButtons(quote, author) {
    const siteUrl = window.location.href; // Lien vers ton site
    const fullQuote = `"${quote}" - ${author}\n${siteUrl}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullQuote)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(fullQuote)}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullQuote)}`;
    const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(siteUrl)}&title=${encodeURIComponent(fullQuote)}`;
    const instagramMessage = `https://www.instagram.com/direct/inbox/?text=${encodeURIComponent(fullQuote)}`;

    document.getElementById('share-twitter').onclick = () => window.open(twitterUrl, '_blank');
    document.getElementById('share-facebook').onclick = () => window.open(facebookUrl, '_blank');
    document.getElementById('share-whatsapp').onclick = () => window.open(whatsappUrl, '_blank');
    document.getElementById('share-linkedin').onclick = () => window.open(linkedinUrl, '_blank');
    document.getElementById('share-instagram').onclick = () => window.open(instagramMessage, '_blank');

    // Copier le lien dans le presse-papiers
    document.getElementById('copy-link').onclick = () => {
        navigator.clipboard.writeText(fullQuote);
        showMessage('success', 'Lien copié dans le presse-papiers !');
    };
}

// Effacer les messages
function clearMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = '';
    messageDiv.className = '';
}

// Afficher un message
function showMessage(type, text) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = type; // success ou error
    messageDiv.innerText = text;
}

// Gestion des étoiles
const stars = document.querySelectorAll('.rating span');
stars.forEach((star, index) => {
    // Survol de l'étoile
    star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => s.classList.toggle('filled', i <= index));
    });

    // Quitter le survol
    star.addEventListener('mouseleave', () => {
        stars.forEach((s) => s.classList.remove('filled'));
    });

    // Clic pour enregistrer la note
    star.addEventListener('click', async () => {
        const citationId = document.getElementById('quote-section').dataset.id;
        const note = index + 1;

        const response = await fetch('/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ citation_id: citationId, note: note, user_id: userId })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('success', data.message); // Message de succès
            loadRating(citationId); // Charger la moyenne après avoir voté
            document.getElementById('average-rating').style.display = 'block'; // Afficher la moyenne
        } else {
            showMessage('error', data.message); // Message d'erreur
        }
    });
});

// Lier les événements
document.getElementById('submit-comment').addEventListener('click', addComment);

// Charger la citation et les fonctionnalités associées
loadQuote();

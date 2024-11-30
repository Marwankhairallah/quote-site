// Import Firebase SDKs
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Ajouter un commentaire
const addComment = async (db, commentText) => {
    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            text: commentText,
            timestamp: new Date(),
        });
        alert('Commentaire envoyé avec succès !');
    } catch (error) {
        alert('Erreur lors de l\'envoi du commentaire : ' + error.message);
    }
};

// Gestionnaire pour le bouton d'envoi
document.getElementById('submit-comment').addEventListener('click', async () => {
    const comment = document.getElementById('comment').value;
    if (comment.trim() !== '') {
        await addComment(db, comment);
        document.getElementById('comment').value = '';
    } else {
        alert('Veuillez entrer un commentaire.');
    }
});

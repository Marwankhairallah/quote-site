// Import Firebase SDKs
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Référence Firestore
let db;
let currentQuoteId = null;

// Initialisation de Firestore
export const initializeDatabase = (firestoreInstance) => {
    db = firestoreInstance;
};

// Gérer les étoiles
const setupRatingStars = () => {
    const starsContainer = document.getElementById("stars");
    starsContainer.innerHTML = ""; // Réinitialiser les étoiles

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.dataset.value = i;

        star.addEventListener("mouseenter", () => {
            // Remplir les étoiles jusqu'à celle survolée
            [...starsContainer.children].forEach((s, index) => {
                s.style.color = index < i ? "#FFD700" : "#ddd";
            });
        });

        star.addEventListener("mouseleave", () => {
            // Réinitialiser les étoiles
            [...starsContainer.children].forEach((s) => {
                s.style.color = s.classList.contains("active") ? "#FFD700" : "#ddd";
            });
        });

        star.addEventListener("click", async () => {
            // Gérer le clic pour noter
            [...starsContainer.children].forEach((s) => s.classList.remove("active"));
            star.classList.add("active");

            // Envoyer la note à Firestore
            const rating = parseInt(star.dataset.value);
            if (currentQuoteId) {
                const notesCollection = collection(db, "notes");
                const alreadyVoted = await hasUserAlreadyVoted(currentQuoteId);
                if (!alreadyVoted) {
                    await addDoc(notesCollection, { quoteId: currentQuoteId, rating });
                    alert(`Merci pour votre note : ${rating} étoiles !`);
                    // Calculer et afficher la moyenne des notes
                    displayAverageRating();
                } else {
                    alert("Vous avez déjà voté pour cette citation.");
                }
            }
        });

        starsContainer.appendChild(star);
    }
};

// Vérifier si l'utilisateur a déjà voté
const hasUserAlreadyVoted = async (quoteId) => {
    const notesCollection = collection(db, "notes");
    const notesQuery = query(notesCollection, where("quoteId", "==", quoteId));
    const querySnapshot = await getDocs(notesQuery);
    return !querySnapshot.empty; // Si une note existe déjà, retourne vrai
};

// Afficher la moyenne des notes
const displayAverageRating = async () => {
    if (!currentQuoteId) return;

    const notesCollection = collection(db, "notes");
    const notesQuery = query(notesCollection, where("quoteId", "==", currentQuoteId));
    const querySnapshot = await getDocs(notesQuery);

    let total = 0;
    let count = 0;

    querySnapshot.forEach((doc) => {
        total += doc.data().rating;
        count++;
    });

    const average = count > 0 ? (total / count).toFixed(1) : 0;
    const starsContainer = document.getElementById("stars");
    const fullStars = Math.floor(average);
    const halfStar = average - fullStars >= 0.5;

    // Mettre à jour les étoiles affichées
    [...starsContainer.children].forEach((star, index) => {
        star.style.color = index < fullStars ? "#FFD700" : "#ddd";
        if (index === fullStars && halfStar) {
            star.style.background = "linear-gradient(to right, #FFD700 50%, #ddd 50%)";
        }
    });

    // Afficher la valeur moyenne
    const ratingText = document.createElement("p");
    ratingText.textContent = `Moyenne des notes : ${average} étoiles`;
    starsContainer.insertAdjacentElement("afterend", ratingText);
};

// Charger et afficher une citation
export const loadQuote = async () => {
    const quotesCollection = collection(db, "quotes");
    const quotesQuery = query(quotesCollection);
    const querySnapshot = await getDocs(quotesQuery);

    let quotes = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!data.last_used_date || new Date(data.last_used_date) < new Date()) {
            quotes.push(data);
        }
    });

    if (quotes.length > 0) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        currentQuoteId = randomQuote.id;
        document.getElementById("quote-container").innerHTML = `
            <p>${randomQuote.text}</p>
            <p><strong>${randomQuote.author}</strong></p>
        `;

        // Mettre à jour la date d'utilisation
        await addDoc(collection(db, "quotes"), {
            id: currentQuoteId,
            last_used_date: new Date().toISOString(),
        });
    } else {
        document.getElementById("quote-container").textContent =
            "Aucune citation disponible pour aujourd'hui.";
    }

    setupRatingStars();
};

// Ajouter un commentaire
const addComment = async (commentText) => {
    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            text: commentText,
            quoteId: currentQuoteId,
            timestamp: new Date(),
        });
        alert("Commentaire envoyé avec succès !");
        displayComments();
    } catch (error) {
        alert("Erreur lors de l'envoi du commentaire : " + error.message);
    }
};

// Afficher les commentaires pour la citation actuelle
const displayComments = async () => {
    if (!currentQuoteId) return;

    const commentsCollection = collection(db, "comments");
    const commentsQuery = query(commentsCollection, where("quoteId", "==", currentQuoteId));
    const querySnapshot = await getDocs(commentsQuery);

    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <p>${data.text}</p>
            <small>${new Date(data.timestamp.toDate()).toLocaleString()}</small>
        `;
        commentsList.appendChild(listItem);
    });
};

// Gestionnaire pour le bouton d'envoi de commentaire
document.getElementById("submit-comment").addEventListener("click", async () => {
    const comment = document.getElementById("comment").value;
    if (comment.trim() !== "") {
        await addComment(comment);
        document.getElementById("comment").value = "";
    } else {
        alert("Veuillez entrer un commentaire.");
    }
});

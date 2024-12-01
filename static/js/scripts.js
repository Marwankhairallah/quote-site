// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCXBfBW6bHfdiJaNmAdZ871Cmt7ZcPs-Do",
    authDomain: "quote-site-b9024.firebaseapp.com",
    projectId: "quote-site-b9024",
    storageBucket: "quote-site-b9024.firebasestorage.app",
    messagingSenderId: "777925326089",
    appId: "1:777925326089:web:04cc8b3172383e32b68fd8",
    measurementId: "G-WKZNTYXB58"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables globales
let currentQuoteId = null;
let userId = localStorage.getItem("userId");

// Générer un ID utilisateur si non existant
if (!userId) {
    userId = `user-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("userId", userId);
}

// Fonction pour récupérer une citation unique par jour
const fetchDailyQuote = async () => {
    try {
        const quotesCollection = collection(db, "quotes");
        const querySnapshot = await getDocs(quotesCollection);

        const quotes = [];
        querySnapshot.forEach((doc) => {
            quotes.push({ id: doc.id, ...doc.data() });
        });

        if (quotes.length === 0) {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        const today = new Date();
        const dailyIndex = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        const quoteIndex = dailyIndex % quotes.length;

        const dailyQuote = quotes[quoteIndex];
        currentQuoteId = dailyQuote.id;

        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
        `;

        fetchComments(); // Charger les commentaires liés à cette citation
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
    }
};

// Fonction pour initialiser les étoiles (VERSION INTACTE)
const initializeStars = () => {
    const stars = document.querySelectorAll(".star");
    const ratingMessage = document.getElementById("rating-message");

    stars.forEach((star, index) => {
        // Gestion du survol des étoiles
        star.addEventListener("mouseover", () => {
            stars.forEach((s, i) => s.classList.toggle("hovered", i <= index));
        });

        star.addEventListener("mouseout", () => {
            stars.forEach((s) => s.classList.remove("hovered"));
        });

        // Gestion du clic pour noter
        star.addEventListener("click", async () => {
            const rating = index + 1;

            if (!currentQuoteId) {
                ratingMessage.innerText = "Impossible de noter sans citation.";
                return;
            }

            // Vérifier si l'utilisateur a déjà noté cette citation
            const ratingsCollection = collection(db, "notes");
            const q = query(ratingsCollection, where("quoteId", "==", currentQuoteId), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                ratingMessage.innerText = "Vous avez déjà noté cette citation.";
                return;
            }

            // Ajouter la note dans Firebase
            try {
                await addDoc(ratingsCollection, {
                    quoteId: currentQuoteId,
                    userId: userId,
                    rating: rating,
                    timestamp: new Date()
                });

                // Afficher la confirmation et allumer les étoiles
                ratingMessage.innerText = `Merci pour votre note de ${rating} étoile(s) !`;
                stars.forEach((s, i) => s.classList.toggle("selected", i <= index));
            } catch (error) {
                ratingMessage.innerText = "Erreur lors de l'enregistrement de votre note.";
                console.error(error);
            }
        });
    });
};

// Fonction pour ajouter un commentaire
const addComment = async () => {
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert("Veuillez entrer un commentaire.");
        return;
    }

    if (!currentQuoteId) {
        alert("Aucune citation sélectionnée pour ajouter un commentaire.");
        return;
    }

    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            quoteId: currentQuoteId,
            userId: userId,
            text: commentText,
            timestamp: new Date()
        });

        commentInput.value = ""; // Réinitialiser le champ de texte
        fetchComments(); // Recharger les commentaires
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
        alert("Erreur lors de l'ajout du commentaire.");
    }
};

// Fonction pour charger les commentaires liés à une citation
const fetchComments = async () => {
    if (!currentQuoteId) {
        document.getElementById("comments").innerText = "Aucun commentaire disponible.";
        return;
    }

    try {
        const commentsCollection = collection(db, "comments");
        const q = query(commentsCollection, where("quoteId", "==", currentQuoteId));
        const querySnapshot = await getDocs(q);

        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = ""; // Réinitialiser le conteneur

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `
                <p>${data.text}</p>
                <p><small>${new Date(data.timestamp.toDate()).toLocaleString()}</small></p>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
    }
};

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchDailyQuote();

    const submitButton = document.getElementById("submit-comment");
    submitButton.addEventListener("click", addComment);

    initializeStars(); // Initialiser les étoiles
});

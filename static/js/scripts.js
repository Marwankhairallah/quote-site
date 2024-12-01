// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc
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
let currentQuoteId = null; // ID de la citation affichée
let userId = localStorage.getItem("userId"); // Stocker l'ID utilisateur dans le localStorage

// Si aucun userId n'est défini, en générer un
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

        // Calculer un index unique pour la citation du jour
        const today = new Date();
        const totalQuotes = quotes.length;
        const dailyIndex = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate(); // ID unique par jour
        const quoteIndex = dailyIndex % totalQuotes; // Index basé sur le nombre total de citations

        const dailyQuote = quotes[quoteIndex];

        // Afficher la citation
        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
        `;

        // Mettre à jour l'ID de la citation en cours
        currentQuoteId = dailyQuote.id;

        // Charger les commentaires pour la citation
        fetchComments();
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
        document.getElementById("quote-container").innerText = "Erreur lors du chargement de la citation.";
    }
};

// Fonction pour charger les commentaires
const fetchComments = async () => {
    try {
        if (!currentQuoteId) {
            document.getElementById("comments").innerText = "Aucun commentaire disponible.";
            return;
        }

        const commentsCollection = collection(db, "comments");
        const q = query(commentsCollection, where("quoteId", "==", currentQuoteId));
        const querySnapshot = await getDocs(q);

        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = ""; // Réinitialiser les commentaires affichés

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const commentElement = document.createElement("div");
            commentElement.className = "comment";
            commentElement.innerHTML = `
                <p>${data.text}</p>
                <p><small>${new Date(data.timestamp.toDate()).toLocaleString()}</small></p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
    }
};

// Fonction pour ajouter un commentaire
const addComment = async () => {
    const commentInput = document.getElementById("comment");
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

        commentInput.value = ""; // Réinitialiser le champ de commentaire
        fetchComments(); // Recharger les commentaires
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};

// Fonction pour initialiser les étoiles
const initializeStars = () => {
    const stars = document.querySelectorAll(".star");
    const ratingMessage = document.createElement("div");
    ratingMessage.id = "rating-message";
    document.getElementById("rating-container").appendChild(ratingMessage);

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

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchDailyQuote();
    initializeStars();

    // Associer le bouton "Envoyer" à l'ajout de commentaire
    document.getElementById("submit-comment").addEventListener("click", addComment);
});

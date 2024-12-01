// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
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

        // Empêcher la même citation deux jours d'affilée
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const yesterdayQuote = quotes[(dailyIndex - 1) % totalQuotes];
        if (yesterdayQuote.id === dailyQuote.id) {
            const alternativeIndex = (quoteIndex + 1) % totalQuotes;
            dailyQuote = quotes[alternativeIndex];
        }

        // Afficher la citation
        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
        `;

        // Mettre à jour l'ID de la citation en cours
        currentQuoteId = dailyQuote.id;

        // Mettre à jour la dernière utilisation de cette citation
        const quoteDoc = doc(db, "quotes", dailyQuote.id);
        await updateDoc(quoteDoc, { last_used_date: today.toISOString() });
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
        document.getElementById("quote-container").innerText = "Erreur lors du chargement de la citation.";
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

            // Ajouter la logique de vote ici
            ratingMessage.innerText = `Merci pour votre note de ${rating} étoile(s) !`;
        });
    });
};

// Fonction pour charger les commentaires
const fetchComments = async (quoteId) => {
    // Ajouter la logique pour charger les commentaires liés à la citation
};

// Fonction pour ajouter un commentaire
const addComment = async (text) => {
    // Ajouter la logique pour enregistrer les commentaires dans la base de données
};

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchDailyQuote();
    initializeStars();
});

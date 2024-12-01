// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

// Fonction pour récupérer une citation aléatoire
const fetchRandomQuote = async () => {
    try {
        const quotesCollection = collection(db, "quotes");

        // Charger toutes les citations sauf celle utilisée hier
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const querySnapshot = await getDocs(quotesCollection);
        const quotes = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.last_used_date || new Date(data.last_used_date) < yesterday) {
                quotes.push({ id: doc.id, ...data });
            }
        });

        if (quotes.length === 0) {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        // Sélectionner une citation aléatoire
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        // Afficher la citation
        document.getElementById("quote-container").innerHTML = `
            <p>${randomQuote.text}</p>
            <p><strong>${randomQuote.author}</strong></p>
        `;

        // Mettre à jour l'ID de la citation en cours
        currentQuoteId = randomQuote.id;

        // Mettre à jour last_used_date pour cette citation
        const quoteDoc = doc(db, "quotes", randomQuote.id);
        await updateDoc(quoteDoc, { last_used_date: now.toISOString() });
    } catch (error) {
        document.getElementById("quote-container").innerText = "Erreur lors du chargement de la citation.";
        console.error(error);
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
            const ratingsCollection = collection(db, "ratings");
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
    fetchRandomQuote();
    initializeStars();
});

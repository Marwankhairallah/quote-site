// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    updateDoc,
    doc,
    where
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

// Fonction pour récupérer une citation basée sur la date
const fetchQuoteForToday = async () => {
    try {
        const quotesCollection = collection(db, "quotes");
        const today = new Date().toISOString().split("T")[0]; // Date au format YYYY-MM-DD

        // Chercher une citation avec la date d'aujourd'hui
        const q = query(quotesCollection, where("last_used_date", "==", today));
        const querySnapshot = await getDocs(q);

        let selectedQuote;

        if (!querySnapshot.empty) {
            // Utiliser la citation déjà sélectionnée pour aujourd'hui
            querySnapshot.forEach((doc) => {
                selectedQuote = { id: doc.id, ...doc.data() };
            });
        } else {
            // Si aucune citation n'est utilisée aujourd'hui, en choisir une au hasard
            const allQuotesSnapshot = await getDocs(quotesCollection);
            const quotes = [];

            allQuotesSnapshot.forEach((doc) => {
                quotes.push({ id: doc.id, ...doc.data() });
            });

            const randomIndex = Math.floor(Math.random() * quotes.length);
            selectedQuote = quotes[randomIndex];

            // Mettre à jour la date d'utilisation pour aujourd'hui
            const quoteDoc = doc(db, "quotes", selectedQuote.id);
            await updateDoc(quoteDoc, { last_used_date: today });
        }

        // Afficher la citation sélectionnée
        if (selectedQuote) {
            document.getElementById("quote-container").innerHTML = `
                <p>${selectedQuote.text}</p>
                <p><strong>${selectedQuote.author}</strong></p>
            `;

            // Mettre à jour l'ID de la citation actuelle
            currentQuoteId = selectedQuote.id;

            // Charger les commentaires associés
            fetchComments(currentQuoteId);
        } else {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
        }
    } catch (error) {
        document.getElementById("quote-container").innerText = "Erreur lors du chargement de la citation.";
        console.error(error);
    }
};

// Fonction pour charger les commentaires
const fetchComments = async (quoteId) => {
    try {
        const commentsCollection = collection(db, "comments");
        const q = query(commentsCollection, where("quote_id", "==", quoteId));
        const querySnapshot = await getDocs(q);

        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = ""; // Efface les anciens commentaires

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");

            const date = new Date(data.timestamp.seconds * 1000).toLocaleString();
            const note = data.note ? ` - Note : ${data.note}` : ""; // Affiche la note si elle existe

            commentDiv.innerHTML = `<strong>${date}</strong>${note}<p>${data.text}</p>`;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
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

// Fonction pour ajouter un commentaire
const addComment = async (text) => {
    if (!text.trim()) {
        alert("Le commentaire ne peut pas être vide.");
        return;
    }

    try {
        await addDoc(collection(db, "comments"), {
            text: text.trim(),
            timestamp: new Date(),
            user_id: userId,
            quote_id: currentQuoteId
        });

        // Recharge les commentaires
        fetchComments(currentQuoteId);

        // Efface le champ de texte
        document.getElementById("comment").value = "";
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};

// Ajoute un gestionnaire au bouton d'envoi de commentaire
document.getElementById("submit-comment").addEventListener("click", () => {
    const commentText = document.getElementById("comment").value;
    addComment(commentText);
});

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchQuoteForToday(); // Charge la citation du jour
    initializeStars();
});

// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase (remplace avec tes clés Firebase)
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
            console.error("Aucune citation disponible pour aujourd'hui.");
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        // Sélectionner une citation aléatoire
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        // Afficher la citation dans le conteneur
        document.getElementById("quote-container").innerHTML = `
            <p>${randomQuote.text}</p>
            <p><strong>${randomQuote.author}</strong></p>
        `;

        // Mettre à jour last_used_date pour cette citation
        const quoteDoc = doc(db, "quotes", randomQuote.id);
        await updateDoc(quoteDoc, { last_used_date: now.toISOString() });
    } catch (error) {
        console.error("Erreur lors de la récupération de la citation :", error);
        document.getElementById("quote-container").innerText = "Erreur lors du chargement de la citation.";
    }
};

// Fonction pour initialiser les étoiles
const initializeStars = () => {
    const stars = document.querySelectorAll(".star");

    stars.forEach((star, index) => {
        star.addEventListener("mouseover", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("hovered", i <= index);
            });
        });

        star.addEventListener("mouseout", () => {
            stars.forEach((s) => s.classList.remove("hovered"));
        });

        star.addEventListener("click", async () => {
            const rating = index + 1;
            alert(`Vous avez noté ${rating} étoile(s) !`);
            // Vous pouvez ensuite enregistrer la note dans Firebase ici
        });
    });
};

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchRandomQuote();
    initializeStars();
});

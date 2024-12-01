import { getFirestore, collection, doc, updateDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();

// Variables pour l'ID de la citation du jour
let quoteId = null;

// Fonction pour récupérer une citation aléatoire
const fetchRandomQuote = async () => {
    try {
        const today = new Date().toISOString().split("T")[0]; // Date du jour au format YYYY-MM-DD
        const quotesCollection = collection(db, "quotes");

        // Récupérer toutes les citations sauf celles utilisées aujourd'hui ou hier
        const q = query(quotesCollection, where("last_used_date", "!=", today));
        const querySnapshot = await getDocs(q);

        // Convertir les résultats en tableau
        const quotes = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (!data.last_used_date || data.last_used_date !== today) {
                quotes.push({ id: docSnap.id, ...data });
            }
        });

        // Choisir une citation au hasard
        if (quotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const randomQuote = quotes[randomIndex];

            // Mettre à jour la date d'utilisation dans la base
            await updateDoc(doc(db, "quotes", randomQuote.id), {
                last_used_date: today,
            });

            // Afficher la citation sur la page
            document.getElementById("quote-container").innerHTML = `
                <p>${randomQuote.text}</p>
                <p><strong>${randomQuote.author}</strong></p>
            `;

            // Stocker l'ID pour les votes/commentaires
            quoteId = randomQuote.id;
        } else {
            alert("Aucune citation disponible pour aujourd'hui !");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de la citation :", error);
    }
};

// Initialisation
fetchRandomQuote();

// Importer les SDK Firebase nécessaires
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Initialiser Firestore
const db = getFirestore();

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

// Exécuter la fonction au chargement
fetchRandomQuote();

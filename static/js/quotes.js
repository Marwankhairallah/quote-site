import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let currentQuoteId = null;

const fetchDailyQuote = async () => {
    try {
        // Vérifiez si une citation est déjà enregistrée pour aujourd'hui dans le localStorage
        const savedQuote = JSON.parse(localStorage.getItem("dailyQuote"));
        const today = new Date().toISOString().slice(0, 10); // Format : "YYYY-MM-DD"

        if (savedQuote && savedQuote.date === today) {
            // Chargez la citation depuis le localStorage
            document.getElementById("quote-container").innerHTML = `
                <p>${savedQuote.text}</p>
                <p><strong>${savedQuote.author}</strong></p>
                <p><em>${savedQuote.reference || "Pas de référence disponible"}</em></p>
            `;
            currentQuoteId = savedQuote.id;
            return;
        }

        // Sinon, chargez une nouvelle citation depuis Firebase
        const quotesCollection = collection(db, "quotes");
        const querySnapshot = await getDocs(quotesCollection);

        const quotes = [];
        querySnapshot.forEach((doc) => quotes.push({ id: doc.id, ...doc.data() }));

        if (quotes.length === 0) {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        // Calculer l'index basé sur la date
        const totalQuotes = quotes.length;
        const dailyIndex = new Date().getFullYear() * 1000 + new Date().getMonth() * 100 + new Date().getDate();
        const quoteIndex = dailyIndex % totalQuotes;

        const dailyQuote = quotes[quoteIndex];

        // Affichez la citation
        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
            <p><em>${dailyQuote.reference || "Pas de référence disponible"}</em></p>
        `;

        // Enregistrez la citation pour aujourd'hui dans le localStorage
        localStorage.setItem(
            "dailyQuote",
            JSON.stringify({
                id: dailyQuote.id,
                text: dailyQuote.text,
                author: dailyQuote.author,
                reference: dailyQuote.reference, // Ajout du champ references
                date: today,
            })
        );

        currentQuoteId = dailyQuote.id;
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
    }
};

export { fetchDailyQuote, currentQuoteId };

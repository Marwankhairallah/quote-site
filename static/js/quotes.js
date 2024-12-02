import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let currentQuoteId = null;

const fetchDailyQuote = async () => {
    try {
        const quotesCollection = collection(db, "quotes");
        const querySnapshot = await getDocs(quotesCollection);

        const quotes = [];
        querySnapshot.forEach((doc) => quotes.push({ id: doc.id, ...doc.data() }));

        if (quotes.length === 0) {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        const today = new Date();
        const totalQuotes = quotes.length;
        const dailyIndex = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        const quoteIndex = dailyIndex % totalQuotes;

        const dailyQuote = quotes[quoteIndex];
        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
        `;

        currentQuoteId = dailyQuote.id;
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
    }
};

export { fetchDailyQuote, currentQuoteId };

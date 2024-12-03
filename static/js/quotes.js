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
        `;

        // Enregistrez la citation pour aujourd'hui dans le localStorage
        localStorage.setItem(
            "dailyQuote",
            JSON.stringify({
                id: dailyQuote.id,
                text: dailyQuote.text,
                author: dailyQuote.author,
                date: today,
            })
        );

        currentQuoteId = dailyQuote.id;
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
    }
};

const setupShareButtons = (quote) => {
    const quoteText = `"${quote.text}" - ${quote.author}`;
    const encodedQuote = encodeURIComponent(quoteText);
    const shareUrl = window.location.href; // Lien vers votre site
    const encodedUrl = encodeURIComponent(shareUrl);

    document.getElementById("share-whatsapp").href = `https://wa.me/?text=${encodedQuote}%20${encodedUrl}`;
    document.getElementById("share-twitter").href = `https://twitter.com/intent/tweet?text=${encodedQuote}&url=${encodedUrl}`;
    document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById("share-linkedin").href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    // Afficher les boutons de partage
    document.getElementById("share-buttons").style.display = "block";
};


export { fetchDailyQuote, currentQuoteId };

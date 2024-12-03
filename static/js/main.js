import { setupAuth } from "./auth.js";
import { fetchDailyQuote, currentQuoteId } from "./quotes.js";
import { fetchComments } from "./comments.js";
import { initializeStars } from "./ratings.js";
import "./share.js";


document.addEventListener("DOMContentLoaded", async () => {
    setupAuth();
    await fetchDailyQuote(); // Charger la citation quotidienne
    fetchComments(currentQuoteId); // Charger les commentaires associés à la citation
    initializeStars(); // Initialiser les étoiles pour les notes
});

import { setupAuth } from "./auth.js";
import { fetchDailyQuote } from "./quotes.js";
import { fetchComments } from "./comments.js";

document.addEventListener("DOMContentLoaded", () => {
    setupAuth();
    fetchDailyQuote().then(fetchComments);
});

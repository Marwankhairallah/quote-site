import { fetchDailyQuote } from "./scripts/quotes.js";
import { fetchComments, addComment } from "./scripts/comments.js";
import { handleRatings } from "./scripts/ratings.js";
import { monitorAuthState, handleSignup, handleLogin, handleLogout, showLoginForm, showSignupForm, closeForms } from "./scripts/auth.js";

// Initialisation des événements
document.addEventListener("DOMContentLoaded", async () => {
    const quoteId = await fetchDailyQuote();
    monitorAuthState();

    document.getElementById("submit-comment").addEventListener("click", () => {
        const commentInput = document.getElementById("comment");
        const commentText = commentInput.value.trim();
        addComment(quoteId, userId, commentText).then(() => fetchComments(quoteId));
    });

    handleRatings(quoteId, userId);

    document.getElementById("show-login").addEventListener("click", showLoginForm);
    document.getElementById("show-signup").addEventListener("click", showSignupForm);
    document.querySelectorAll(".close-form").forEach((button) => button.addEventListener("click", closeForms));

    document.getElementById("signup-submit").addEventListener("click", handleSignup);
    document.getElementById("login-submit").addEventListener("click", handleLogin);
    document.getElementById("logout-button").addEventListener("click", handleLogout);
});

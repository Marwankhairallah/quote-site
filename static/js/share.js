// Fonction pour partager sur WhatsApp
const shareOnWhatsApp = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://wa.me/?text=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

// Fonction pour partager sur Twitter
const shareOnTwitter = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

// Fonction pour partager sur Facebook
const shareOnFacebook = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        "https://your-site-url.com"
    )}&quote=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

// Fonction pour partager sur LinkedIn
const shareOnLinkedIn = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        "https://your-site-url.com"
    )}&title=Quote&summary=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

// Rendre les fonctions disponibles globalement
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareOnTwitter = shareOnTwitter;
window.shareOnFacebook = shareOnFacebook;
window.shareOnLinkedIn = shareOnLinkedIn;

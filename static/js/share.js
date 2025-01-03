const siteUrl = "https://quote-site-b9024.web.app/"; // Remplacez par l'URL réelle de votre site

const shareOnWhatsApp = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://wa.me/?text=${encodeURIComponent(`${quoteText} ${siteUrl}`)}`;
    window.open(url, "_blank");
};

const shareOnTwitter = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${quoteText} ${siteUrl}`)}`;
    window.open(url, "_blank");
};

const shareOnFacebook = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        siteUrl
    )}&quote=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

const shareOnLinkedIn = () => {
    const quoteText = document.getElementById("quote-container").innerText;
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        siteUrl
    )}&title=Quote&summary=${encodeURIComponent(quoteText)}`;
    window.open(url, "_blank");
};

// Expose les fonctions globalement
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareOnTwitter = shareOnTwitter;
window.shareOnFacebook = shareOnFacebook;
window.shareOnLinkedIn = shareOnLinkedIn;

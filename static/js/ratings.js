import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { userId } from "./auth.js";
import { currentQuoteId } from "./quotes.js";

const initializeStars = () => {
    const stars = document.querySelectorAll(".star");
    const ratingMessage = document.createElement("div");
    ratingMessage.id = "rating-message";
    document.getElementById("rating-container").appendChild(ratingMessage);

    stars.forEach((star, index) => {
        // Gestion du survol des étoiles
        star.addEventListener("mouseover", () => {
            stars.forEach((s, i) => s.classList.toggle("hovered", i <= index));
        });

        star.addEventListener("mouseout", () => {
            stars.forEach((s) => s.classList.remove("hovered"));
        });

        // Gestion du clic pour noter
        star.addEventListener("click", async () => {
            const rating = index + 1;

            if (!currentQuoteId) {
                ratingMessage.innerText = "Impossible de noter sans citation.";
                return;
            }

            if (!userId) {
                ratingMessage.innerText = "Vous devez être connecté pour voter.";
                return;
            }

            const ratingsCollection = collection(db, "notes");
            const q = query(ratingsCollection, where("quoteId", "==", currentQuoteId), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                ratingMessage.innerText = "Vous avez déjà noté cette citation.";
                return;
            }

            try {
                await addDoc(ratingsCollection, {
                    quoteId: currentQuoteId,
                    userId: userId,
                    rating: rating,
                    timestamp: new Date()
                });

                ratingMessage.innerText = `Merci pour votre note de ${rating} étoile(s) !`;
                stars.forEach((s, i) => s.classList.toggle("selected", i <= index));
            } catch (error) {
                ratingMessage.innerText = "Erreur lors de l'enregistrement de votre note.";
                console.error(error);
            }
        });
    });
};

export { initializeStars };

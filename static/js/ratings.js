import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { userId } from "./auth.js";
import { currentQuoteId } from "./quotes.js";

const initializeStars = () => {
    const stars = document.querySelectorAll(".star");
    const ratingMessage = document.createElement("div");
    ratingMessage.id = "rating-message";
    document.getElementById("rating-container").appendChild(ratingMessage);

    const averageRatingElement = document.createElement("div");
    averageRatingElement.id = "average-rating";
    averageRatingElement.style.display = "none"; // Masquer par défaut
    document.getElementById("rating-container").appendChild(averageRatingElement);

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
                // Ajouter la note dans la collection `notes`
                await addDoc(ratingsCollection, {
                    quoteId: currentQuoteId,
                    userId: userId,
                    rating: rating,
                    timestamp: new Date()
                });

                ratingMessage.innerText = `Merci pour votre note de ${rating} étoile(s) !`;
                stars.forEach((s, i) => s.classList.toggle("selected", i <= index));

                // Mettre à jour la moyenne dans la collection `quotes`
                await updateAverageRating();
                displayAverageRating(averageRatingElement); // Afficher la moyenne
            } catch (error) {
                ratingMessage.innerText = "Erreur lors de l'enregistrement de votre note.";
                console.error(error);
            }
        });
    });
};

// Fonction pour mettre à jour la moyenne des notes
const updateAverageRating = async () => {
    const ratingsCollection = collection(db, "notes");
    const q = query(ratingsCollection, where("quoteId", "==", currentQuoteId));
    const querySnapshot = await getDocs(q);

    let totalRating = 0;
    let totalVotes = 0;

    querySnapshot.forEach((doc) => {
        totalRating += doc.data().rating;
        totalVotes++;
    });

    const averageRating = totalVotes > 0 ? (totalRating / totalVotes).toFixed(1) : 0;

    const quoteRef = doc(db, "quotes", currentQuoteId);
    await updateDoc(quoteRef, { moyenne: averageRating });
};

// Fonction pour afficher la moyenne des notes
const displayAverageRating = async (element) => {
    const quoteRef = doc(db, "quotes", currentQuoteId); // Référence du document
    const quoteDoc = await getDoc(quoteRef); // Utiliser `getDoc` pour une référence de document

    if (quoteDoc.exists()) {
        const { moyenne } = quoteDoc.data();
        element.innerHTML = `Note moyenne : <span class="average-stars">${'★'.repeat(Math.floor(moyenne))}${'☆'.repeat(5 - Math.floor(moyenne))}</span> (${moyenne})`;
        element.style.display = "block";
    }
};

export { initializeStars };

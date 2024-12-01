import { getFirestore, collection, getDocs, query, orderBy, limit, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();

// Charger une citation aléatoire sauf celle d'hier
const fetchRandomQuote = async () => {
    const quotesCollection = collection(db, "quotes");
    const q = query(quotesCollection, orderBy("last_used_date", "asc"), limit(1));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const quoteDoc = querySnapshot.docs[0];
        const quoteData = quoteDoc.data();

        // Mettre à jour la date de dernière utilisation
        await updateDoc(doc(db, "quotes", quoteDoc.id), {
            last_used_date: new Date().toISOString().split("T")[0]
        });

        // Afficher la citation
        document.getElementById("quote-container").innerHTML = `
            <p>${quoteData.text}</p>
            <p><strong>${quoteData.author}</strong></p>
        `;
    } else {
        document.getElementById("quote-container").innerHTML = `
            <p>Aucune citation disponible.</p>
        `;
    }
};

// Gestion des étoiles
let currentRating = 0; // Stocke la note sélectionnée
const stars = document.querySelectorAll(".star");

// Gestion des clics pour attribuer une note
stars.forEach((star, index) => {
    star.addEventListener("click", () => {
        currentRating = index + 1;
        updateStars(currentRating);
        alert(`Vous avez noté ${currentRating} étoiles !`);
    });
});

// Gestion du survol pour afficher un aperçu de la note
stars.forEach((star, index) => {
    star.addEventListener("mouseover", () => {
        updateStars(index + 1); // Met à jour les étoiles jusqu'à l'étoile survolée
    });
    star.addEventListener("mouseout", () => {
        updateStars(currentRating); // Restaure l'état des étoiles selon la note sélectionnée
    });
});

// Mise à jour de l'affichage des étoiles
const updateStars = (rating) => {
    stars.forEach((star, i) => {
        if (i < rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
};

// Gestion des commentaires
document.getElementById("submit-comment").addEventListener("click", async () => {
    const comment = document.getElementById("comment").value.trim();
    if (comment !== "") {
        await addDoc(collection(db, "comments"), {
            text: comment,
            rating: currentRating || null,
            timestamp: new Date()
        });
        alert("Commentaire ajouté !");
        document.getElementById("comment").value = "";
    } else {
        alert("Veuillez entrer un commentaire.");
    }
});

// Initialisation
fetchRandomQuote();

import { getFirestore, collection, getDocs, query, orderBy, limit, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();

let currentRating = 0; // Note actuelle

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
const stars = document.querySelectorAll(".star");

// Gestion du survol pour allumer les étoiles
stars.forEach((star) => {
    star.addEventListener("mouseover", () => {
        const rating = star.getAttribute("data-value");
        updateStars(rating);
    });

    star.addEventListener("mouseout", () => {
        updateStars(currentRating); // Restaure l'état selon la note sélectionnée
    });

    star.addEventListener("click", async () => {
        currentRating = star.getAttribute("data-value");
        updateStars(currentRating);

        // Ajouter la note à la base de données
        await addDoc(collection(db, "notes"), {
            rating: parseInt(currentRating),
            timestamp: new Date()
        });

        alert(`Merci d'avoir noté ${currentRating} étoiles !`);
    });
});

// Met à jour l'affichage des étoiles
const updateStars = (rating) => {
    stars.forEach((star) => {
        if (star.getAttribute("data-value") <= rating) {
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

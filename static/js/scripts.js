import { getFirestore, collection, getDocs, query, where, orderBy, limit, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();

// Charger une citation aléatoire sauf celle d'hier
const fetchRandomQuote = async () => {
    const quotesCollection = collection(db, "quotes");
    const today = new Date();
    today.setDate(today.getDate() - 1); // Hier
    const yesterdayString = today.toISOString().split("T")[0];

    const q = query(
        quotesCollection,
        where("last_used_date", "!=", yesterdayString),
        orderBy("last_used_date"),
        limit(1)
    );

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

// Ajouter un commentaire
const addComment = async (quoteId, commentText) => {
    const commentsCollection = collection(db, "comments");
    await addDoc(commentsCollection, {
        quoteId,
        text: commentText,
        timestamp: new Date(),
    });
    alert('Commentaire envoyé avec succès !');
    displayComments(quoteId);
};

// Afficher les commentaires associés à une citation
const displayComments = async (quoteId) => {
    const commentsCollection = collection(db, "comments");
    const q = query(commentsCollection, where("quoteId", "==", quoteId));
    const querySnapshot = await getDocs(q);

    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = ""; // Réinitialiser

    querySnapshot.forEach((doc) => {
        const comment = doc.data();
        const commentEl = document.createElement("div");
        commentEl.textContent = comment.text;
        commentsList.appendChild(commentEl);
    });
};

// Gestion des étoiles
let currentRating = 0;
document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", async (e) => {
        const value = e.target.getAttribute("data-value");
        currentRating = parseInt(value);
        document.querySelectorAll(".star").forEach((s) => {
            s.classList.remove("active");
        });
        for (let i = 0; i < currentRating; i++) {
            document.querySelectorAll(".star")[i].classList.add("active");
        }
        alert(`Vous avez noté ${currentRating} étoiles !`);
        // Ajouter le vote dans Firestore (ajustez en fonction de votre structure)
    });
});

// Initialisation
fetchRandomQuote();

import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { userId } from "./auth.js";
import { currentQuoteId } from "./quotes.js";


const fetchComments = async (currentQuoteId) => {
    try {
        if (!currentQuoteId) {
            document.getElementById("comments").innerText = "Aucun commentaire disponible.";
            return;
        }

        const commentsCollection = collection(db, "comments");
        const q = query(commentsCollection, where("quoteId", "==", currentQuoteId));
        const querySnapshot = await getDocs(q);

        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = "";

        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            const userDoc = await getDoc(doc(db, "users", data.userId)); // Récupérer le nom d'utilisateur
            const username = userDoc.exists() ? userDoc.data().username : "Utilisateur inconnu";
            const commentElement = document.createElement("div");
            commentElement.className = "comment";
            commentElement.innerHTML = `
                <p><strong>${username}</strong> : ${data.text}</p>
                <p><small>${new Date(data.timestamp.toDate()).toLocaleString()}</small></p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
    }
};

const addComment = async (currentQuoteId) => {
    const commentInput = document.getElementById("comment");
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert("Veuillez entrer un commentaire.");
        return;
    }

    if (!currentQuoteId) {
        alert("Aucune citation sélectionnée pour ajouter un commentaire.");
        return;
    }

    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            quoteId: currentQuoteId,
            userId: userId,
            text: commentText,
            timestamp: new Date()
        });

        commentInput.value = "";
        fetchComments(currentQuoteId);
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};


document.getElementById("submit-comment").addEventListener("click", () => addComment(currentQuoteId));

export { fetchComments, addComment };

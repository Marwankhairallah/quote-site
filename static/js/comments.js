import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { userId } from "./auth.js";

const fetchComments = async (quoteId) => {
    try {
        if (!quoteId) {
            document.getElementById("comments").innerText = "Aucun commentaire disponible.";
            return;
        }

        const commentsCollection = collection(db, "comments");
        const q = query(commentsCollection, where("quoteId", "==", quoteId));
        const querySnapshot = await getDocs(q);

        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const commentElement = document.createElement("div");
            commentElement.className = "comment";
            commentElement.innerHTML = `
                <p>${data.text}</p>
                <p><small>${new Date(data.timestamp.toDate()).toLocaleString()}</small></p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
    }
};

const addComment = async (quoteId) => {
    const commentInput = document.getElementById("comment");
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert("Veuillez entrer un commentaire.");
        return;
    }

    if (!quoteId) {
        alert("Aucune citation sélectionnée pour ajouter un commentaire.");
        return;
    }

    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            quoteId: quoteId,
            userId: userId,
            text: commentText,
            timestamp: new Date()
        });

        commentInput.value = "";
        fetchComments(quoteId);
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};


document.getElementById("submit-comment").addEventListener("click", () => addComment(currentQuoteId));

export { fetchComments, addComment };

import { db } from "./firebase-config.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { currentQuoteId } from "./quotes.js";

const fetchComments = async () => {
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

const addComment = async (userId) => {
    const commentInput = document.getElementById("comment");
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert("Veuillez entrer un commentaire.");
        return;
    }

    try {
        await addDoc(collection(db, "comments"), {
            quoteId: currentQuoteId,
            userId,
            text: commentText,
            timestamp: new Date()
        });

        commentInput.value = "";
        fetchComments();
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};

export { fetchComments, addComment };

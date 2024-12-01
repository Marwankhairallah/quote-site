import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

export const fetchComments = async (quoteId) => {
    try {
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

export const addComment = async (quoteId, userId, commentText) => {
    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, {
            quoteId,
            userId,
            text: commentText,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
};

// Import Firebase SDKs nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = { 
    apiKey: "AIzaSyCXBfBW6bHfdiJaNmAdZ871Cmt7ZcPs-Do",
    authDomain: "quote-site-b9024.firebaseapp.com",
    projectId: "quote-site-b9024",
    storageBucket: "quote-site-b9024.firebasestorage.app",
    messagingSenderId: "777925326089",
    appId: "1:777925326089:web:04cc8b3172383e32b68fd8",
    measurementId: "G-WKZNTYXB58"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables globales
let userId = null;
let currentQuoteId = null;

// Fonction pour basculer l'affichage des formulaires
const showLoginForm = () => {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
};

const showSignupForm = () => {
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
};

const closeForms = () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
};

// Gestion des boutons de formulaire
document.getElementById("show-login").addEventListener("click", showLoginForm);
document.getElementById("show-signup").addEventListener("click", showSignupForm);
document.querySelectorAll(".close-form").forEach((button) => {
    button.addEventListener("click", closeForms);
});

// Gestion de l'inscription
document.getElementById("signup-submit").addEventListener("click", async () => {
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const passwordConfirm = document.getElementById("signup-password-confirm").value.trim();

    if (password !== passwordConfirm) {
        alert("Les mots de passe ne correspondent pas !");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ajouter le nom d'utilisateur dans Firestore
        await setDoc(doc(db, "users", user.uid), { username, email });
        alert("Inscription réussie !");
        closeForms();
    } catch (error) {
        alert("Erreur lors de l'inscription : " + error.message);
    }
});

// Gestion de la connexion
document.getElementById("login-submit").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Connexion réussie !");
        closeForms();
    } catch (error) {
        alert("Erreur lors de la connexion : " + error.message);
    }
});

// Gestion du mot de passe oublié
document.getElementById("forgot-password").addEventListener("click", async () => {
    const email = prompt("Entrez votre email pour réinitialiser votre mot de passe :");
    if (!email) return;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Un email de réinitialisation a été envoyé !");
    } catch (error) {
        alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
    }
});

// Déconnexion
document.getElementById("logout-button").addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Déconnexion réussie !");
    } catch (error) {
        alert("Erreur lors de la déconnexion : " + error.message);
    }
});

// Surveiller l'état de l'utilisateur
onAuthStateChanged(auth, (user) => {
    const userInfo = document.getElementById("user-info");
    const authButtons = document.getElementById("auth-buttons");
    const commentInput = document.getElementById("comment");
    const submitCommentButton = document.getElementById("submit-comment");

    if (user) {
        userId = user.uid;
        userInfo.style.display = "block";
        authButtons.style.display = "none";
        commentInput.disabled = false;
        submitCommentButton.disabled = false;
        document.getElementById("user-email").innerText = user.email;
    } else {
        userId = null;
        userInfo.style.display = "none";
        authButtons.style.display = "block";
        commentInput.disabled = true;
        submitCommentButton.disabled = true;
    }
});

// Fonction pour récupérer une citation quotidienne
const fetchDailyQuote = async () => {
    try {
        const quotesCollection = collection(db, "quotes");
        const querySnapshot = await getDocs(quotesCollection);

        const quotes = [];
        querySnapshot.forEach((doc) => {
            quotes.push({ id: doc.id, ...doc.data() });
        });

        if (quotes.length === 0) {
            document.getElementById("quote-container").innerText = "Aucune citation disponible.";
            return;
        }

        const today = new Date();
        const totalQuotes = quotes.length;
        const dailyIndex = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        const quoteIndex = dailyIndex % totalQuotes;

        const dailyQuote = quotes[quoteIndex];
        document.getElementById("quote-container").innerHTML = `
            <p>${dailyQuote.text}</p>
            <p><strong>${dailyQuote.author}</strong></p>
        `;

        currentQuoteId = dailyQuote.id;
        fetchComments();
    } catch (error) {
        console.error("Erreur lors du chargement de la citation :", error);
    }
};

// Fonction pour charger les commentaires
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

// Fonction pour ajouter un commentaire
document.getElementById("submit-comment").addEventListener("click", async () => {
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
        fetchComments();
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire :", error);
    }
});

// Exécuter les fonctions au chargement
document.addEventListener("DOMContentLoaded", () => {
    fetchDailyQuote();
});

import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Variables globales
let userId = null;

// Fonction pour valider les emails
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Fonction pour valider les mots de passe (avec caractères spéciaux)
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
};

// Fonctionnalités d'authentification
const setupAuth = () => {
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

    document.getElementById("show-login").addEventListener("click", showLoginForm);
    document.getElementById("show-signup").addEventListener("click", showSignupForm);
    document.querySelectorAll(".close-form").forEach((button) => button.addEventListener("click", closeForms));

    // Gestion de l'inscription (avec validation)
    document.getElementById("signup-submit").addEventListener("click", async () => {
        const username = document.getElementById("signup-username").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();
        const passwordConfirm = document.getElementById("signup-password-confirm").value.trim();

        if (!isValidEmail(email)) {
            showNotification("Adresse email invalide.", "error");
            return;
        }

        if (!isValidPassword(password)) {
            showNotification(
                "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, un chiffre et un caractère spécial.",
                "error"
            );
            return;
        }

        if (password !== passwordConfirm) {
            showNotification("Les mots de passe ne correspondent pas.", "error");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), { username, email });
            showNotification("Inscription réussie !", "success");
            closeForms();
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error.code);
            showNotification(friendlyMessage, "error");
        }
    });

    // Gestion de la connexion (avec validation)
    document.getElementById("login-submit").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!isValidEmail(email)) {
            showNotification("Adresse email invalide.", "error");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showNotification("Connexion réussie !", "success");
            closeForms();
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error.code);
            showNotification(friendlyMessage, "error");
        }
    });

    document.getElementById("forgot-password").addEventListener("click", async () => {
        const email = prompt("Entrez votre email pour réinitialiser votre mot de passe :");
        if (!email) return;

        try {
            await sendPasswordResetEmail(auth, email);
            showNotification("Un email de réinitialisation a été envoyé !", "success");
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error.code);
            showNotification(friendlyMessage, "error");
        }
    });

    document.getElementById("logout-button").addEventListener("click", async () => {
        try {
            await signOut(auth);
            showNotification("Vous avez été déconnecté.", "success");
        } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(error.code);
            showNotification(friendlyMessage, "error");
        }
    });

    onAuthStateChanged(auth, async (user) => {
        const userInfo = document.getElementById("user-info");
        const authButtons = document.getElementById("auth-buttons");
        const commentInput = document.getElementById("comment");
        const submitCommentButton = document.getElementById("submit-comment");

        if (user) {
            userId = user.uid;

            // Récupérer le nom d'utilisateur depuis Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const username = userDoc.exists() ? userDoc.data().username : "Utilisateur";

            userInfo.style.display = "block";
            authButtons.style.display = "none";
            commentInput.disabled = false;
            submitCommentButton.disabled = false;
            document.getElementById("user-email").innerText = `Bonjour, ${username}!`;
        } else {
            userId = null;
            userInfo.style.display = "none";
            authButtons.style.display = "block";
            commentInput.disabled = true;
            submitCommentButton.disabled = true;
        }
    });
};

// Messages d'erreur conviviaux
const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
        case "auth/email-already-in-use":
            return "Cette adresse email est déjà utilisée.";
        case "auth/invalid-email":
            return "Adresse email invalide.";
        case "auth/user-not-found":
            return "Utilisateur introuvable.";
        case "auth/wrong-password":
            return "Mot de passe incorrect.";
        default:
            return "Une erreur est survenue. Veuillez réessayer.";
    }
};

const showNotification = (message, type) => {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";
    notification.style.backgroundColor = type === "success" ? "#d4edda" : "#f8d7da";
    notification.style.color = type === "success" ? "#155724" : "#721c24";
    notification.style.padding = "10px";
    notification.style.margin = "10px 0";
    notification.style.border = type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
    notification.style.borderRadius = "5px";
    notification.style.textAlign = "center";

    setTimeout(() => {
        notification.style.display = "none";
    }, 5000); // Cacher après 5 secondes
};

export { setupAuth, userId };

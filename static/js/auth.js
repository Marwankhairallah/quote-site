import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Variables globales
let userId = null;

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
            await setDoc(doc(db, "users", user.uid), { username, email });
            alert("Inscription réussie !");
            closeForms();
        } catch (error) {
            alert("Erreur lors de l'inscription : " + error.message);
        }
    });

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

    document.getElementById("logout-button").addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Déconnexion réussie !");
        } catch (error) {
            alert("Erreur lors de la déconnexion : " + error.message);
        }
    });

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
};

export { setupAuth, userId };

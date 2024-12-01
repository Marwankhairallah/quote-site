import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase (remplace avec tes clés Firebase)
const firebaseConfig = {
    apiKey: "TON_API_KEY",
    authDomain: "TON_PROJECT_ID.firebaseapp.com",
    projectId: "TON_PROJECT_ID",
    storageBucket: "TON_PROJECT_ID.appspot.com",
    messagingSenderId: "TON_MESSAGING_ID",
    appId: "TON_APP_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour charger les citations depuis quotes.json et les importer dans Firestore
const importQuotes = async () => {
    try {
        // Charger le fichier JSON local
        const response = await fetch('./quotes.json');
        const quotes = await response.json();

        // Ajouter chaque citation dans Firestore
        for (let quote of quotes) {
            await addDoc(collection(db, "quotes"), {
                ...quote,
                last_used_date: quote.last_used_date || null // Par précaution
            });
            console.log(`Citation ajoutée : ${quote.text}`);
        }
        console.log("Toutes les citations ont été importées avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'importation :", error);
    }
};

// Exécuter l'importation
importQuotes();

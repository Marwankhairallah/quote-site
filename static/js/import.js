import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase (remplace par tes propres clés Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCXBfBW6bHfdiJaNmAdZ871Cmt7ZcPs-Do",
    authDomain: "quote-site-b9024.firebaseapp.com",
    projectId: "quote-site-b9024",
    storageBucket: "quote-site-b9024.appspot.com",
    messagingSenderId: "777925326089",
    appId: "1:777925326089:web:04cc8b3172383e32b68fd8",
    measurementId: "G-WKZNTYXB58"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger les données depuis quotes.json
const fetchQuotes = async () => {
    try {
        const response = await fetch('./quotes.json'); // Charge le fichier JSON
        const quotes = await response.json();

        // Ajouter les citations dans Firestore
        for (let quote of quotes) {
            await addDoc(collection(db, "quotes"), {
                ...quote,
                created_at: new Date() // Ajoute un timestamp
            });
            console.log(`Citation ajoutée : ${quote.text}`);
        }
    } catch (error) {
        console.error("Erreur lors de l'importation des citations :", error);
    }
};

fetchQuotes();

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuration Firebase (remplace avec tes clés Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCXBfBW6bHfdiJaNmAdZ871Cmt7ZcPs-Do",
    authDomain: "quote-site-b9024.firebaseapp.com",
    projectId: "quote-site-b9024",
    storageBucket: "quote-site-b9024.firebasestorage.app",
    messagingSenderId: "777925326089",
    appId: "1:777925326089:web:04cc8b3172383e32b68fd8",
    measurementId: "G-WKZNTYXB58"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

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

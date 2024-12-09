import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs/promises";

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

const importQuotes = async () => {
    try {
        const data = await fs.readFile('./quotes.json', 'utf8');
        const quotes = JSON.parse(data);

        for (const quote of quotes) {
            await addDoc(collection(db, "quotes"), {
                ...quote,
                last_used_date: quote.last_used_date || null,
            });
            console.log(`Citation ajoutée : ${quote.text}`);
        }

        console.log("Toutes les citations ont été importées avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'importation :", error);
    }
};

importQuotes();

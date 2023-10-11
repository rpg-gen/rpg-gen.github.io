import { initializeApp } from "firebase/app";

export default function useFirebaseProject() {
    const firebase_config = {
        apiKey: "AIzaSyB7KcGLNztLk0KmjJ7CCyIQmwvchLaRbCw",
        authDomain: "rpg-gen.firebaseapp.com",
        projectId: "rpg-gen",
        storageBucket: "rpg-gen.appspot.com",
        messagingSenderId: "167071727845",
        appId: "1:167071727845:web:59a5ff82df16db1c0b940c"
    };
    
    const firebase_app = initializeApp(firebase_config);

    return firebase_app;
}
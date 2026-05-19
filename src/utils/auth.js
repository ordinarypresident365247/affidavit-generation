import { auth } from "./firebase";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider } from "firebase/auth";

const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error logging in with Google:", error);
    }
};

const loginWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error logging in:", error);
    }
};
const registerWithEmailAndPassword = async (email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error registering:", error);
    }
};
const logout = async () => {
    await signOut(auth);
};
const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error resetting password:", error);
    }
};
const passwordChange = async (email) => {
    try {
        await updatePassword(auth.currentUser, email);
    } catch (error) {
        console.error("Error changing password:", error);
    }
};
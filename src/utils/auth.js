import { auth, db, firebaseConfig } from "./firebase";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, query, where, getDocs, collection } from "firebase/firestore";

import { initializeApp } from "firebase/app";


export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error logging in with Google:", error);
        throw error; // Added throw
    }
};

export const loginWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error logging in:", error);
        throw error; // Added throw
    }
};
// export const registerWithEmailAndPassword = async (email, password) => {
//     try {
//         await createUserWithEmailAndPassword(auth, email, password);
//     } catch (error) {
//         console.error("Error registering:", error);
//     }
// };
export const registerWithEmailAndPassword = async (email, password, profileData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Auth Profile DisplayName
        await updateProfile(user, { displayName: profileData.fullName });

        // Save User Profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            fullName: profileData.fullName,
            accountType: profileData.accountType,
            courtTitle: profileData.courtTitle || null,
            courtState: profileData.courtState || null,
            createdAt: serverTimestamp()
        });

        return user;
    } catch (error) {
        console.error("Error registering:", error);
        throw error;
    }
};

export const logout = async () => {
    await signOut(auth);
};
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error resetting password:", error);
    }
};
export const passwordChange = async (password) => {
    try {
        await updatePassword(auth.currentUser, password);
    } catch (error) {
        console.error("Error changing password:", error);
    }
};
export const checkEmailExists = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};
// Function for Admin to create users without being logged out
export const adminCreateUser = async (profileData) => {
    // 1. Initialize a secondary Firebase App
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
        // Check if email exists in our records first
        const exists = await checkEmailExists(profileData.email);
        if (exists) {
            throw new Error("This email address is already registered in the system.");
        }

        // 2. Create the user in the secondary instance
        const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth, 
            profileData.email, 
            profileData.password
        );
        const newUser = userCredential.user;

        // 3. Set display name for the new user
        await updateProfile(newUser, { displayName: profileData.fullName });

        // 4. Save to Firestore (using the primary DB instance)
        await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: profileData.email,
            fullName: profileData.fullName,
            accountType: profileData.accountType,
            courtTitle: profileData.courtTitle || null,
            courtTitleLine2: profileData.courtTitleLine2 || null,
            courtSealUrl: profileData.courtSealUrl,
            courtState: profileData.courtState || null,
            createdBy: auth.currentUser.uid, // Track which admin created them
            createdAt: serverTimestamp()
        });

        // 5. Important: Sign out from the secondary instance and delete the app
        await signOut(secondaryAuth);
        
        return newUser;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email address is already in use by another account.");
        }
        console.error("Admin Creation Error:", error);
        throw error;
    }
};
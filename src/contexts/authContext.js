import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ userLoggedIn, setUserLoggedIn ] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Fetch custom profile data from Firestore
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // Merge Auth user with Firestore data
                        setCurrentUser({ ...user, ...userData });
                    } else {
                        // Fallback if Firestore doc hasn't been created yet
                        setCurrentUser({ ...user });
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    setCurrentUser({ ...user });
                }
                setUserLoggedIn(true);
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);
            }   
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userLoggedIn,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            { !loading && children }
        </AuthContext.Provider>
    );
};
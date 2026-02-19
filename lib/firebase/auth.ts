import { auth, db } from "./config";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const signUp = async (email: string, password: string, name: string, role: 'reporter' | 'supervisor') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Create user document in Firestore with role
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        throw error;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw error;
    }
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
            // Create user document for first time Google sign-in (default to reporter)
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName || "Google User",
                email: user.email,
                role: 'reporter', // Default role for Google sign-in
                createdAt: new Date().toISOString()
            });
        }

        return user;
    } catch (error) {
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        throw error;
    }
}

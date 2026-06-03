import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, getDoc, runTransaction, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const stateCodeMap = {
  "Abia": "AB", "Adamawa": "AD", "Akwa Ibom": "AK", "Anambra": "AN", "Bauchi": "BA",
  "Bayelsa": "BY", "Benue": "BN", "Borno": "BR", "Cross River": "CR", "Delta": "DT",
  "Ebonyi": "EB", "Edo": "ED", "Ekiti": "EK", "Enugu": "EN", "FCT": "FCT", "Abuja": "FCT",
  "Gombe": "GB", "Imo": "IM", "Jigawa": "JG", "Kaduna": "KD", "Kano": "KN",
  "Katsina": "KT", "Kebbi": "KB", "Kogi": "KG", "Kwara": "KW", "Lagos": "LA",
  "Nasarawa": "NA", "Niger": "NI", "Ogun": "OG", "Ondo": "ON", "Osun": "OS",
  "Oyo": "OY", "Plateau": "PL", "Rivers": "RI", "Sokoto": "SO", "Taraba": "TR",
  "Yobe": "YB", "Zamfara": "ZM"
};

const generateAffidavitIdentifier = async (stateName) => {
  const stateCode = stateCodeMap[stateName] || "XX";
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", `${stateCode}_${year}`);

  // Transactionally increment the serial number
  const newSerial = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let count = 1;
    if (counterDoc.exists()) {
      count = counterDoc.data().count + 1;
    }
    transaction.set(counterRef, { count });
    return count;
  });

  const serialStr = newSerial.toString().padStart(6, '0');
  return `${stateCode}-${year}-HRT-${serialStr}`;
};

export const saveAffidavitData = async (currentUser, data) => {
  const userId = currentUser.uid;
  try {
    const affidavitIdentifier = await generateAffidavitIdentifier(currentUser.courtState);

    let passportUrl       = "";
    let fingerprintUrl    = "";

    // Use the signature URLs passed from the selected commissioner/registrar in formData
    let commissionerSignatureUrl = data.commissionerSignature || "";
    let registrarSignatureUrl = data.registrarSignature || "";

    // 1. Upload Passport Photo to Storage
    if (data.passportPhoto) {
      console.log("Uploading passport...");
      const passportRef = ref(storage, `affidavits/${userId}/${Date.now()}_passport.jpg`);
      const uploadResult = await uploadBytes(passportRef, data.passportPhoto);
      passportUrl = await getDownloadURL(uploadResult.ref);
    }

    // 2. Upload Fingerprint (Base64 to Blob)
    if (data.fingerprintData) {
      console.log("Uploading fingerprint...")
      const response = await fetch(data.fingerprintData);
      const blob = await response.blob();
      const fingerprintRef = ref(storage, `affidavits/${userId}/${Date.now()}_fingerprint.png`);
      const uploadResult = await uploadBytes(fingerprintRef, blob);
      fingerprintUrl = await getDownloadURL(uploadResult.ref);
    }

    // 3. Save Record to Firestore
    const affidavitRef = collection(db, "affidavits");
    const docRef = await addDoc(affidavitRef, {
      creatorId: currentUser.uid,
      courtTitle: currentUser.courtTitle,
      courtState: currentUser.courtState,
      fullName: data.fullName,
      nin: data.nin,
      address: data.address,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      stateOfOrigin: data.stateOfOrigin,
      lga: data.lga,
      familyName: data.familyName,
      fathersName: data.fathersName,
      fathersVillage: data.fathersVillage,
      mothersName: data.mothersName,
      mothersVillage: data.mothersVillage,
      // affidavitCode: data.affidavitCode,
      affidavitIdentifier: affidavitIdentifier,
      caseType: data.caseType,
      commissionerId: data.commissionerId,
      commissionerName: data.commissionerName,
      commissionerTitle: data.commissionerTitle,
      registrarId: data.registrarId,
      registrarName: data.registrarName,
      registrarTitle: data.registrarTitle,
      passportUrl,
      fingerprintUrl,
      commissionerSignatureUrl,
      registrarSignatureUrl,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving affidavit:", error);
    throw error;
  }
};

export const getAffidavitsByUserId = async (userId) => {
  try {
    const affidavitRef = collection(db, "affidavits");
    // Ensure we use 'creatorId' to match the field saved in saveAffidavitData
    const q = query(
      affidavitRef, 
      where("creatorId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const affidavits = [];
    
    querySnapshot.forEach((doc) => {
      affidavits.push({ id: doc.id, ...doc.data() });
    });
    
    return affidavits;
  } catch (error) {
    console.error("Error fetching affidavits:", error);
    throw error;
  }
};

export const getAffidavitById = async (id) => {
  try {
    const docRef = doc(db, "affidavits", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching affidavit:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getAllAffidavits = async () => {
  try {
    const affidavitRef = collection(db, "affidavits");
    const q = query(affidavitRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const affidavits = [];
    querySnapshot.forEach((doc) => {
      affidavits.push({ id: doc.id, ...doc.data() });
    });
    
    return affidavits;
  } catch (error) {
    console.error("Error fetching all affidavits:", error);
    throw error;
  }
};

export const getAffidavitByIdentifier = async (identifier) => {
  try {
    const affidavitRef = collection(db, "affidavits");
    const q = query(affidavitRef, where("affidavitIdentifier", "==", identifier));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      throw new Error("Record not found");
    }
  } catch (error) {
    console.error("Error fetching affidavit by identifier:", error);
    throw error;
  }
};

const COLLECTION_NAME = "commissioners";

/**
 * Saves commissioner data to Firestore
 * @param {Object} data - The commissioner details (name, designation, location, etc.)
 */
export const saveCommissionerData = async (userId, data) => {
    try {
        let signatureUrl = "";

        // Upload Signature to Storage if it exists as a File
        if (data.signature && data.signature instanceof File) {
            const signatureRef = ref(storage, `commissioners/signatures/${Date.now()}_${data.signature.name}`);
            const uploadResult = await uploadBytes(signatureRef, data.signature);
            signatureUrl = await getDownloadURL(uploadResult.ref);
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            creatorId: userId,
            name: data.name,
            court: data.court,
            signature: signatureUrl,
            createdAt: serverTimestamp()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error saving commissioner data: ", error);
        throw error;
    }
};

/**
 * Retrieves all commissioner records from Firestore
 */
export const getCommissioners = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("creatorId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching commissioners: ", error);
        throw error;
    }
};

/**
 * Retrieves a single commissioner record by ID
 */
export const getCommissionerById = async (id) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Commissioner not found");
        }
    } catch (error) {
        console.error("Error fetching commissioner: ", error);
        throw error;
    }
};

/**
 * Updates a commissioner record in Firestore
 */
export const updateCommissioner = async (id, data) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        let updateData = { 
            name: data.name,
            court: data.court,
            updatedAt: serverTimestamp() 
        };

        // Only upload if a new File is provided
        if (data.signature && data.signature instanceof File) {
            const signatureRef = ref(storage, `commissioners/signatures/${Date.now()}_${data.signature.name}`);
            const uploadResult = await uploadBytes(signatureRef, data.signature);
            updateData.signature = await getDownloadURL(uploadResult.ref);
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating commissioner: ", error);
        throw error;
    }
};

/**
 * Deletes a commissioner record from Firestore
 */
export const deleteCommissioner = async (id) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting commissioner: ", error);
        throw error;
    }
};

const REGISTRARS_COLLECTION = "registrars";

/**
 * Saves registrar data to Firestore
 */
export const saveRegistrarData = async (userId, data) => {
    try {
        let signatureUrl = "";

        // Upload Signature to Storage if it exists
        if (data.signature && data.signature instanceof File) {
            // Added ${userId}/ to the path for better security
            const signatureRef = ref(storage, `registrars/signatures/${userId}/${Date.now()}_${data.signature.name}`);
            const uploadResult = await uploadBytes(signatureRef, data.signature);
            signatureUrl = await getDownloadURL(uploadResult.ref);
        }

        const docRef = await addDoc(collection(db, REGISTRARS_COLLECTION), {
            creatorId: userId,
            name: data.name,
            title: data.title,
            signature: signatureUrl,
            createdAt: serverTimestamp()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error saving registrar data: ", error);
        throw error;
    }
};

/**
 * Retrieves all registrar records for a user
 */
export const getRegistrars = async (userId) => {
    try {
        const q = query(
            collection(db, REGISTRARS_COLLECTION), 
            where("creatorId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching registrars: ", error);
        throw error;
    }
};

/**
 * Retrieves a single registrar record by ID
 */
export const getRegistrarById = async (id) => {
    try {
        const docRef = doc(db, REGISTRARS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Registrar not found");
        }
    } catch (error) {
        console.error("Error fetching registrar: ", error);
        throw error;
    }
};

/**
 * Updates a registrar record
 */
export const updateRegistrar = async (id, data) => {
    try {
        const docRef = doc(db, REGISTRARS_COLLECTION, id);
        let updateData = { 
            name: data.name,
            title: data.title,
            updatedAt: serverTimestamp() 
        };

        if (data.signature && data.signature instanceof File) {
            const signatureRef = ref(storage, `registrars/signatures/${Date.now()}_${data.signature.name}`);
            const uploadResult = await uploadBytes(signatureRef, data.signature);
            updateData.signature = await getDownloadURL(uploadResult.ref);
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating registrar: ", error);
        throw error;
    }
};

/**
 * Deletes a registrar record
 */
export const deleteRegistrar = async (id) => {
    try {
        const docRef = doc(db, REGISTRARS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting registrar: ", error);
        throw error;
    }
};
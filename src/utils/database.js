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
  return `${stateCode}-${year}-${serialStr}`;
};

export const saveAffidavitData = async (currentUser, data) => {
  const userId = currentUser.uid;
  try {
    const affidavitIdentifier = await generateAffidavitIdentifier(currentUser.courtState);

    let passportUrl       = "";
    let fingerprintUrl    = "";
    let commissionerSignatureUrl = "";

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

    // 3. Upload Judge Signature
    if (data.commissionerSignature) {
      console.log("Uploading commissioner signature...");
      const signatureRef = ref(storage, `affidavits/${userId}/${Date.now()}_signature.png`);
      const uploadResult = await uploadBytes(signatureRef, data.commissionerSignature);
      commissionerSignatureUrl = await getDownloadURL(uploadResult.ref);
    }

    // 3. Save Record to Firestore
    const affidavitRef = collection(db, "affidavits");
    const docRef = await addDoc(affidavitRef, {
      creatorId: currentUser.uid,
      courtTitle: currentUser.courtTitle,
      courtState: currentUser.courtState,
      fullName: data.fullName,
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
      affidavitCode: data.affidavitCode,
      affidavitIdentifier: affidavitIdentifier,
      caseType: data.caseType,
      commissionerName: data.commissionerName,
      commissionerTitle: data.commissionerTitle,
      passportUrl,
      fingerprintUrl,
      commissionerSignatureUrl,
      createdAt: serverTimestamp(),
      //createdAt: new Date().toISOString()
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
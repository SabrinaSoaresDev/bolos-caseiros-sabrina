import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1Vw_kW_yC2KVCiXIt8u1bZDFKF-5WdGE",
  authDomain: "bolos-caseiros-sabrina.firebaseapp.com",
  projectId: "bolos-caseiros-sabrina",
  storageBucket: "bolos-caseiros-sabrina.firebasestorage.app",
  messagingSenderId: "21597542799",
  appId: "1:21597542799:web:3eba034089cf9a84ed13fa",
  measurementId: "G-XJKGDMHCNK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
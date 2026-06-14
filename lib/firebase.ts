import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1e7tJcRkAt2meIqdi9KKuGoulHvD95yg",
  authDomain: "gamecentral-3ee9d.firebaseapp.com",
  projectId: "gamecentral-3ee9d",
  storageBucket: "gamecentral-3ee9d.appspot.com",
  messagingSenderId: "571294835092",
  appId: "1:571294835092:web:36fc557fd6bf26ad462f81",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
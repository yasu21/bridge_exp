// Initialize Cloud Firestore through Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import { getFunctions } from 'firebase/functions'

const app = initializeApp({
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.SENDERID,
  appId: process.env.APPID
})

const db = getFirestore(app)
// const functions = getFunctions(app)
// export default { db, functions }
export default db

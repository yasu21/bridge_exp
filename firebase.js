// Initialize Cloud Firestore through Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import { getFunctions } from 'firebase/functions'

const app = initializeApp({
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.senderId,
  appId: process.env.appId
})

const db = getFirestore(app)
// const functions = getFunctions(app)
// export default { db, functions }
export default db

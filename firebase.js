// Initialize Cloud Firestore through Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import { getFunctions } from 'firebase/functions'

const app = initializeApp({
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.strageBucket,
  messagingSenderId: process.env.storageBucket,
  appId: process.env.senderId
})

const db = getFirestore(app)
// const functions = getFunctions(app)
// export default { db, functions }
export default db

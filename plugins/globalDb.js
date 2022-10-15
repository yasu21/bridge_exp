import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  doc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import db from '../firebase.js'

const getDb = async (name, order, wheres) => {
  let datas = []
  const Ref = collection(db, name)
  if (!order) {
    datas = await getDocs(query(Ref, where(wheres[0], wheres[1], wheres[2])))
  } else if (wheres) {
    datas = await getDocs(query(Ref, where(wheres[0], wheres[1], wheres[2]), orderBy(order)))
  } else {
    datas = await getDocs(query(Ref, orderBy(order)))
  }
  const list = datas.docs.map((d) => {
    const obj = d.data()
    obj.id = d.id
    return obj
  })
  return list
}

const putDb = async (name, id, data) => {
  const merge = { merge: true }
  data.updated_at = serverTimestamp()
  const Ref = doc(db, name, id)
  const res = await setDoc(Ref, data, merge)
  return res
}

const postDb = async (name, data) => {
  data.updated_at = serverTimestamp()
  const Ref = collection(db, name)
  const res = await addDoc(Ref, data)
  return res
}

export default (context, inject) => {
  inject('getDb', getDb)
  inject('putDb', putDb)
  inject('postDb', postDb)
}

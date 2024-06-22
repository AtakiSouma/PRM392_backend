import { firebaseApp } from '../firebase/firebase'
export async function verifyToken(idToken: string) {
  try {
    const decodedIdToken = await firebaseApp.auth().verifyIdToken(idToken)
    const userRecord = await firebaseApp.auth().getUser(decodedIdToken.uid)
    return userRecord
  } catch (error) {
    console.error('Xác minh không thành công:', error)
    throw error
  }
}

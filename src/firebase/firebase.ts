import admin, { ServiceAccount } from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'

import serviceAccount from '../firebase/online-shop-app-4572c-firebase-adminsdk-youcq-b467e9f846.json'

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  storageBucket: 'gs://online-shop-app-4572c.appspot.com'
})
const storage = getStorage().bucket()
export default storage

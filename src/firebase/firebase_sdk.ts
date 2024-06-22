// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDo7l--EeNkJjS2kWy1C6w2znRAOAm6UnA',
  authDomain: 'online-shop-app-4572c.firebaseapp.com',
  databaseURL: 'https://online-shop-app-4572c-default-rtdb.firebaseio.com',
  projectId: 'online-shop-app-4572c',
  storageBucket: 'online-shop-app-4572c.appspot.com',
  messagingSenderId: '24543668127',
  appId: '1:24543668127:web:f632b25abd9837685fbfaa',
  measurementId: 'G-7DP8Z4ERC4'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

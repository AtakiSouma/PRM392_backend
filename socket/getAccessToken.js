import { JWT } from 'google-auth-library'
import axios from 'axios'
import fs from 'fs'
import path from 'path';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, '../src/firebase/online-shop-app-4572c-firebase-adminsdk-youcq-b467e9f846.json');
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
//scope

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

//jwt
const client = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES
})
async function getAccessToken() {
  const tokens = await client.authorize()
  // eslint-disable-next-line no-undef
  console.log(tokens.access_token)
  return tokens.access_token
}

getAccessToken()

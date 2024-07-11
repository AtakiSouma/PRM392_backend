import { JWT } from 'google-auth-library'
import axios from 'axios'
import fs from 'fs'

import SERVICE_ACCOUNT_FILE from './src/firebase/online-shop-app-4572c-firebase-adminsdk-youcq-b467e9f846.json'
// load ket
//scope

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

//jwt
const client = new JWT({
  email: SERVICE_ACCOUNT_FILE.client_email,
  key: SERVICE_ACCOUNT_FILE.private_key,
  scopes: SCOPES
})
async function getAccessToken() {
  const tokens = await client.authorize()
  // eslint-disable-next-line no-undef
  console.log(tokens.access_token)
  return tokens.access_token
}

getAccessToken()

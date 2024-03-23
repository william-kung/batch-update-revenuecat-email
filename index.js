// This App extracts the user list, run a loop 
// to update the email get from firebase auth to RevenueCat.

require('dotenv').config();
const users = require('./bin/users.json');
const { initializeApp } = require('firebase-admin/app');
const admin = require("firebase-admin");
const revenueCatApiKey = process.env.REVENUECAT_API_KEY;
const FIREBASE_SERVICE_ACCOUNT_CERT = process.env.FIREBASE_SERVICE_ACCOUNT_CERT;
const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT_CERT);
const axios = require('axios');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

users.forEach(getEmail);

async function getEmail (user) {
  
  let uid = user.app_user_id;

  admin.auth().getUser(uid)
    .then((userRecord) => {
      const userEmail = userRecord.email;

      const revenueCatApiKey = process.env.REVENUECAT_API_KEY;
      const revenueCatApiUrl = `https://api.revenuecat.com/v1/subscribers/${uid}/attributes`;
      const revenueCatHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${revenueCatApiKey}`,
      };
      const responseBody = {
        "attributes": {
          "$email": {
            "value": userEmail,
            "updated_at_ms": Date.now()
          },
        },
      };

      const response = axios.post(revenueCatApiUrl, responseBody, { headers: revenueCatHeaders })
      .then(response => {
        console.log(`RevenueCat subscriber ${uid} email ${userEmail} updated.`);
      })
      .catch(error => {
        console.log(`Error posting subscriber attribute email: ${uid}`);
      });
    })
    .catch((error) => {
      console.log(`Error fetching Firebase user record: ${uid}`);
    });
}

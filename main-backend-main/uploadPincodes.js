const fs = require('fs');
const axios = require('axios');

// Load the pincode.json file
const jsonData = JSON.parse(fs.readFileSync('pincode.json', 'utf-8'));

// URL of your Express API
const API_URL = 'http://localhost:4000/api/pincode'; // Adjust the port if needed

// Iterate over each pincode entry and post it
async function postPincodes() {
    const entries = jsonData.pincode;  // Array of objects

    for (const entry of entries) {
    if (!entry.pincode || entry.pincode.toString().length < 6) {
        console.log(`⚠️ Skipped: ${entry.pincode} (invalid pincode)`);
        continue;  // Skip this entry
    }
    try {
        const response = await axios.post(API_URL, entry);
        console.log(`✅ Posted: ${entry.pincode}`);
    } catch (error) {
        console.error(`❌ Error posting ${entry.pincode}:`, error.response ? error.response.data : error.message);
    }
    }

    console.log('🚀 All entries processed.');
}

postPincodes();

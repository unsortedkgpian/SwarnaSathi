const GoldRate = require("../models/GoldRate");

// To get Gold rate
const axios = require("axios");


// Helper function to check if more than 24 hours passed
function isMoreThan24Hours(oldTime) {
    const now = new Date();
    const lastUpdated = new Date(oldTime);
    const hoursDiff = Math.abs(now - lastUpdated) / 36e5;
    return hoursDiff >= 24;
}

// Function to fetch gold rate from MetalPrice API
async function fetchFromMetalPrice(accessToken, basecurrency) {
    try {
        const response = await axios.get(`https://api.metalpriceapi.com/v1/latest`, {
            params: {
                base: "XAU",
                currencies: basecurrency,
                api_key: accessToken
            }
        });
        const rateKey = "INRXAU";

        const rawRatePerOunce = response.data?.rates?.[rateKey];

        if (!rawRatePerOunce) throw new Error("Rate not found in API response");

        const troyOunceToGram = 31.1035;

        // Calculate pure per-gram rates (without markup)
         // Simulate Indian retail market
        const markupMultiplier = 1.085;
        const ratePerGram24K = (rawRatePerOunce / troyOunceToGram) * markupMultiplier;
        


       
        // Approximate purity-based rates
        // const ratePerGram22K = ratePerGram24K * (22 / 24);
        // const ratePerGram18K = ratePerGram24K * (18 / 24);

        return {
            rawRatePerOunce,
            rate: parseFloat(ratePerGram24K.toFixed(2)),
            // ratePerGram22K: parseFloat(ratePerGram22K.toFixed(2)),
            // ratePerGram18K: parseFloat(ratePerGram18K.toFixed(2)),
        };
    } catch (error) {
        console.error("Error fetching from MetalPrice API:", error.message);
        throw error;
    }
}
// async function fetchFromMetalPrice(accessToken, basecurrency = "INR") {
//     try {
//         const response = await axios.get(`https://api.metalpriceapi.com/v1/latest`, {
//             params: {
//                 base: "XAU",
//                 currencies: basecurrency,
//                 api_key: accessToken
//             }
//         });

//         const rawRatePerOunce = response.data?.rates?.[basecurrency];

//         if (!rawRatePerOunce) throw new Error("Rate not found in API response");

//         const troyOunceToGram = 31.1035;
//         const markupMultiplier = 1.085; // Simulate Indian retail market

//         // Calculate rate per gram with markup
//         const ratePerGram24K = (rawRatePerOunce / troyOunceToGram) * markupMultiplier;

//         // Approximate purity-based rates
//         const ratePerGram22K = ratePerGram24K * (22 / 24);
//         const ratePerGram18K = ratePerGram24K * (18 / 24);

//         return {
//             rawRatePerOunce,
//             ratePerGram24K: parseFloat(ratePerGram24K.toFixed(2)),
//             ratePerGram22K: parseFloat(ratePerGram22K.toFixed(2)),
//             ratePerGram18K: parseFloat(ratePerGram18K.toFixed(2)),
//         };
//     } catch (error) {
//         console.error("Error fetching from MetalPrice API:", error.message);
//         throw error;
//     }
// }

// GET or Refresh gold rate
exports.getGoldRateSettings = async (req, res) => {
    try {
        let settings = await GoldRate.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Gold rate settings not found"
            });
        }

        const { merchant, rate, timestamp, apiaccesstoken, basecurrency } = settings;

        if (!timestamp || isMoreThan24Hours(timestamp)) {
            const newRate = await fetchFromMetalPrice(apiaccesstoken,basecurrency);

            settings.rate = newRate;
            settings.timestamp = new Date();

            await settings.save();

            return res.status(200).json({
                success: true,
                source: "API",
                merchant: merchant,
                basecurrency: basecurrency,
                apiaccesstoken: apiaccesstoken,
                rate: newRate,
                timestamp: settings.timestamp
            });
        }

        return res.status(200).json({
            success: true,
            merchant: merchant,
            basecurrency: basecurrency,
            apiaccesstoken: apiaccesstoken,
            source: "Database",
            rate: rate,
            timestamp: timestamp
        });
    } catch (error) {
        console.error("Error fetching or refreshing gold rate:", error.message);
        let settings = await GoldRate.findOne();
        return res.status(500).json({
            success: false,
            data: settings,
            message: "Failed to get or refresh gold rate",
            error: error.message
        });
    }
};



// 


/**
 * Get gold rate settings
 * @route GET /api/goldrate-settings
 */

// exports.getGoldRateSettings = async (req, res) => {
//     try {
//         const settings = await GoldRate.findOne();
//         if (!settings) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Gold rate settings not found"
//             });
//         }

//         return res.status(200).json(settings);
//     } catch (error) {
//         console.error("Error fetching gold rate settings:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while fetching gold rate settings",
//             error: error.message
//         });
//     }
// };

/**
 * Create new gold rate settings
 * @route POST /api/goldrate-settings
 */
exports.createGoldRateSettings = async (req, res) => {
    try {
        const existing = await GoldRate.findOne();
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Gold rate settings already exist. Use PUT to update."
            });
        }

        const { merchant, apiaccesstoken, basecurrency } = req.body;

        if (!merchant || !apiaccesstoken || !basecurrency ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        

        const goldRate = new GoldRate({
            merchant,
            apiaccesstoken,
            basecurrency,            
            rate,
            timestamp: new Date(),
        });

        const saved = await goldRate.save();

        return res.status(201).json({
            success: true,
            message: "Gold rate settings created successfully",
            data: saved
        });
    } catch (error) {
        console.error("Error creating gold rate settings:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating gold rate settings",
            error: error.message
        });
    }
};

/**
 * Update existing gold rate settings
 * @route PUT /api/goldrate-settings
 */
// exports.updateGoldRateSettings = async (req, res) => {
//     try {
//         const { merchant, apiaccesstoken, basecurrency, refreshinterval, rate } = req.body;

//         let settings = await GoldRate.findOne();

//         if (!settings) {
//             // If settings do not exist, create them
//             settings = new GoldRate({
//                 merchant,
//                 apiaccesstoken,
//                 basecurrency,
//                 refreshinterval,
//                 rate
//             });
//         } else {
//             // Update values
//             settings.merchant = merchant || settings.merchant;
//             settings.apiaccesstoken = apiaccesstoken || settings.apiaccesstoken;
//             settings.basecurrency = basecurrency || settings.basecurrency;
//             settings.refreshinterval = refreshinterval || settings.refreshinterval;
//             settings.rate = rate || settings.rate;
//         }

//         const updated = await settings.save();

//         return res.status(200).json({
//             success: true,
//             message: "Gold rate settings updated successfully",
//             data: updated
//         });
//     } catch (error) {
//         console.error("Error updating gold rate settings:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while updating gold rate settings",
//             error: error.message
//         });
//     }
// };


exports.updateGoldRateSettings = async (req, res) => {
    try {
        const { merchant, apiaccesstoken, basecurrency } = req.body;

        let settings = await GoldRate.findOne();

        // Determine whether to fetch fresh rates
        const mustFetchNew = !settings || 
            settings.merchant !== merchant ||
            settings.apiaccesstoken !== apiaccesstoken ||
            settings.basecurrency !== basecurrency;            

        let rateData;

        if (mustFetchNew) {
            // Fetch fresh rates
            rateData = await fetchFromMetalPrice(apiaccesstoken, basecurrency);
        }

        if (!settings) {
            settings = new GoldRate({
                merchant,
                apiaccesstoken,
                basecurrency,
                rate: rateData.rate,
                timestamp: new Date()
            });
        } else {
            settings.merchant = merchant;
            settings.apiaccesstoken = apiaccesstoken;
            settings.basecurrency = basecurrency;            
            if (mustFetchNew) {
                settings.rate = rateData.rate;
                settings.timestamp = rateData.timestamp;
            }
            settings.timestamp = new Date();
        }

        const updated = await settings.save();

        return res.status(200).json({
            success: true,
            message: mustFetchNew 
                ? "Gold rate fetched from API and updated successfully"
                : "Gold rate settings updated without API call",
            data: updated
        });
    } catch (error) {
        console.error("Error updating gold rate settings:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating gold rate settings",
            error: error.message
        });
    }
};
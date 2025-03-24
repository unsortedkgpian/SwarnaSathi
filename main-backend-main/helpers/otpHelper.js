const FormSubmission = require('../models/BeOurPartner');
const https = require('https');

// TextLocal Configuration
const API_KEY = process.env.TEXTLOCAL_API_KEY;
const SENDER = process.env.TEXTLOCAL_SENDER || 'TXTLCL';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phone, otp) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure phone number is properly formatted (remove +91 if present)
      const formattedPhone = phone.startsWith('+91') 
        ? phone.substring(3) 
        : phone.startsWith('91') 
          ? phone.substring(2) 
          : phone;
      
      // Create the message
      const message =otp + `-is your six digit otp for Swarn Sathi mobile verification`;
      
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Prepare data for TextLocal API
      const data = `apikey=${API_KEY}&sender=${SENDER}&numbers=91${formattedPhone}&message=${encodedMessage}`;
      
      // Set up the request options
      const options = {
        host: 'api.textlocal.in',
        path: `/send?${data}`,
        method: 'GET'
      };
      
      console.log('Sending OTP to:', `91${formattedPhone}`);
      
      // Make the HTTPS request
      const req = https.request(options, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            
            if (parsedData.status === 'success') {
              console.log(`OTP sent to +91${formattedPhone}. Message ID: ${parsedData.message_id || 'N/A'}`);
              resolve({ success: true, message: 'OTP sent successfully' });
            } else {
              // Extract meaningful error message
              const errorMessage = typeof parsedData.errors?.[0] === 'object' 
                ? JSON.stringify(parsedData.errors[0]) 
                : parsedData.errors?.[0] || 'Failed to send SMS';
              
              console.error('TextLocal API Error:', parsedData);
              reject(new Error(errorMessage));
            }
          } catch (error) {
            console.error('Error parsing TextLocal response:', error);
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('TextLocal request error:', error);
        reject(error);
      });
      
      req.end();
      
    } catch (error) {
      console.error(`Error preparing TextLocal request: ${error.message}`);
      reject(new Error('Failed to send OTP: ' + error.message));
    }
  });
};

exports.sendPhoneOTP = async (phone) => {
  try {
    // Validate phone number (Indian format)
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      throw new Error('Invalid phone number format. Please provide a valid 10-digit Indian mobile number.');
    }
    
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    // Store OTP in database
    const formSubmission = await FormSubmission.findOneAndUpdate(
      { phone },
      { otp, otpExpiresAt: expiresAt },
      { upsert: true, new: true }
    );
    
    // Send OTP via TextLocal
    const result = await sendOTP(phone, otp);
    return result;
  } catch (error) {
    console.error('Error in sendPhoneOTP:', error);
    throw new Error('Error sending OTP: ' + error.message);
  }
};

exports.verifyPhoneOTP = async (phone, otp) => {
  try {
    if (!phone || !otp) {
      return { success: false, message: 'Phone number and OTP are required' };
    }
    return { success: true, message: 'Phone verified successfully' };
    console.log("Verifying OTP:", { phone, otp });
    const formSubmission = await FormSubmission.findOne({ phone });
    if (!formSubmission) {
      return { success: false, message: 'Phone number not found' };
    }
    
    // Check if OTP matches
    if (formSubmission.otp !== otp) {
      console.log(`OTP verification failed: expected ${formSubmission.otp}, received ${otp}`);
      return { success: false, message: 'Invalid OTP' };
    }
    
    // Check if OTP has expired
    if (formSubmission.otpExpiresAt < new Date()) {
      return { success: false, message: 'OTP has expired' };
    }

    // Clear OTP data and mark phone as verified
    formSubmission.otp = null;
    formSubmission.otpExpiresAt = null;
    formSubmission.otpVerified = true;
    await formSubmission.save();
    
  } catch (error) {
    console.error('Error in verifyPhoneOTP:', error);
    throw new Error('Error verifying OTP: ' + error.message);
  }
};

// Add a test function that can be used to verify TextLocal API is working correctly
exports.testTextLocalConnection = async () => {
  try {
    if (!API_KEY) {
      return { success: false, message: 'TextLocal API key is not configured' };
    }
    
    // Create a simple test message
    const testPhone = process.env.TEST_PHONE_NUMBER || '9100000000'; // Should be replaced with an actual test number
    const message = 'This is a test message from your application.';
    const encodedMessage = encodeURIComponent(message);
    
    // Log partial API key for debugging (safely)
    const maskedApiKey = API_KEY.length > 8 
      ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` 
      : '****';
    
    console.log('Testing TextLocal connection with API key:', maskedApiKey);
    
    // Prepare data for API check (credits only)
    const data = `apikey=${API_KEY}`;
    
    return new Promise((resolve, reject) => {
      const options = {
        host: 'api.textlocal.in',
        path: `/balance?${data}`,
        method: 'GET'
      };
      
      const req = https.request(options, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            console.log('TextLocal API Test Response:', parsedData);
            
            if (parsedData.status === 'success') {
              resolve({ 
                success: true, 
                message: 'TextLocal connection successful',
                balance: parsedData.balance?.sms || 'N/A',
                details: parsedData
              });
            } else {
              resolve({ 
                success: false, 
                message: 'TextLocal connection failed', 
                error: parsedData.errors?.[0] || 'Unknown error',
                details: parsedData
              });
            }
          } catch (error) {
            console.error('Error parsing TextLocal test response:', error);
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('TextLocal test request error:', error);
        reject(error);
      });
      
      req.end();
    });
  } catch (error) {
    console.error('Error testing TextLocal connection:', error);
    return { success: false, message: 'Error testing TextLocal connection', error: error.message };
  }
};
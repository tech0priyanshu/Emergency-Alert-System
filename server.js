const express = require('express');
const twilio = require('twilio');
const cors = require('cors');  // Import the CORS package
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public'));

// Validate environment variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'EMERGENCY_CONTACT'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Initialize Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Routes
app.post('/api/send-sms', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Test Twilio functionality by sending a test message
    const testMessage = await client.messages.create({
      body: 'Test Message',
      to: process.env.EMERGENCY_CONTACT,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    console.log('Test message SID:', testMessage.sid);  // Log the SID of the test message

    // Now send the actual emergency message
    const twilioMessage = await client.messages.create({
      body: message,
      to: process.env.EMERGENCY_CONTACT,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // Log successful SMS sending
    console.log('Emergency Message SID:', twilioMessage.sid); // Log the SID of the sent emergency message
    res.json({ success: true, messageId: twilioMessage.sid });
  } catch (error) {
    console.error('Twilio Error:', error);  // Log the full error object
    res.status(500).json({
      error: 'Failed to send SMS',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please check the server logs for details.'
    });
  }
});

const PORT = process.env.PORT || 3001; // Change to 3001 or any other free port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


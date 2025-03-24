const Newsletter = require('../models/NewsLetter.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js'); // You'll need to implement this

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if already subscribed
        let subscriber = await Newsletter.findOne({ email });
        
        if (subscriber) {
            if (subscriber.status === 'unsubscribed') {
                subscriber.status = 'active';
                subscriber.unsubscribeToken = crypto.randomBytes(32).toString('hex');
                await subscriber.save();
                
                return res.status(200).json({
                    success: true,
                    message: 'Successfully resubscribed to newsletter'
                });
            }
            
            return res.status(400).json({
                success: false,
                message: 'Email already subscribed'
            });
        }

        // Create new subscriber
        subscriber = await Newsletter.create({
            email,
            unsubscribeToken: crypto.randomBytes(32).toString('hex')
        });

        // Send welcome email
        try {
            await sendEmail({
                email: subscriber.email,
                subject: 'Welcome to Our Newsletter',
                template: 'welcomeEmail',
                data: {
                    unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`
                }
            });
        } catch (error) {
            console.log('Welcome email error:', error);
        }

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error subscribing to newsletter',
            error: error.message
        });
    }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = async (req, res) => {
    try {
        const query = {};

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        const subscribers = await Newsletter.find(query)
            .sort('-subscriptionDate');

        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscribers',
            error: error.message
        });
    }
};

exports.getSubscriber = async (req, res) => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscriber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriber',
            error: error.message
        });
    }
};

// @desc    Update subscriber status
// @route   PUT /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.updateSubscriberStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'blocked', 'unsubscribed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const subscriber = await Newsletter.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscriber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subscriber',
            error: error.message
        });
    }
};

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscriber deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subscriber',
            error: error.message
        });
    }
};

// @desc    Unsubscribe using token
// @route   GET /api/newsletter/unsubscribe/:token
// @access  Public
exports.unsubscribe = async (req, res) => {
    try {
        const subscriber = await Newsletter.findOne({
            unsubscribeToken: req.params.token
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Invalid unsubscribe token'
            });
        }

        subscriber.status = 'unsubscribed';
        await subscriber.save();

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing unsubscribe request',
            error: error.message
        });
    }
};

// @desc    Send offer to subscribers
// @route   POST /api/newsletter/send-offer
// @access  Private/Admin
exports.sendOffer = async (req, res) => {
    try {
        const { offerId, subject, content } = req.body;

        if (!offerId || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Get all active subscribers
        const subscribers = await Newsletter.find({ status: 'active' });

        // Send emails in batches of 50
        const batchSize = 50;
        const totalBatches = Math.ceil(subscribers.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const batch = subscribers.slice(i * batchSize, (i + 1) * batchSize);
            
            const emailPromises = batch.map(subscriber => {
                return sendEmail({
                    email: subscriber.email,
                    subject,
                    template: 'offerEmail',
                    data: {
                        content,
                        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`
                    }
                });
            });

            await Promise.all(emailPromises);

            // Update subscriber records
            const updatePromises = batch.map(subscriber => {
                return Newsletter.findByIdAndUpdate(
                    subscriber._id,
                    {
                        $push: { offers: { offerId, sentDate: new Date() } },
                        lastEmailSent: new Date()
                    }
                );
            });

            await Promise.all(updatePromises);
        }

        res.status(200).json({
            success: true,
            message: `Offer sent to ${subscribers.length} subscribers`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending offer',
            error: error.message
        });
    }
};

exports.sendContact = async (req, res) => {
    try {
      const { name, email, phone, purpose, comments } = req.body;
  
      // Validate required fields
      if (!name || !email || !phone || !purpose || !comments) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: name, email, phone, purpose, and comments'
        });
      }
  
      // Fetch settings to get the recipient email (e.g., primary email)
      const settings = await Setting.findOne();
      if (!settings || !settings.emails.length) {
        return res.status(500).json({
          success: false,
          message: 'No recipient email configured in settings'
        });
      }
  
      // Use the primary email as the recipient, or fallback to the first email
      const recipientEmail = settings.emails.find(e => e.isPrimary)?.email || settings.emails[0].email;
  
      // Prepare email content
      const emailSubject = `New Contact Form Submission: ${purpose}`;
      const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Comments:</strong> ${comments}</p>
      `;
  
      // Send the email
      await sendEmail({
        email: recipientEmail,
        subject: emailSubject,
        html: emailContent // Assuming your sendEmail utility supports HTML content
      });
  
      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!'
      });
    } catch (error) {
      console.error('Error in sendContact:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending contact form',
        error: error.message
      });
    }
  };
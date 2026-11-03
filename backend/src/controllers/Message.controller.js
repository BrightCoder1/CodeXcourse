const Message = require('../models/Message.model');

const createMessage = async (req, res) => {
    try {
        const { ask_about, fullname, email, phone = '', query } = req.body || {};

        if (
            typeof ask_about !== 'string'
            || typeof fullname !== 'string'
            || typeof email !== 'string'
            || typeof phone !== 'string'
            || typeof query !== 'string'
            || !fullname.trim()
            || !email.trim()
            || !query.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your name, email, and message.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const savedMessage = await Message.create({
            ask_about: ask_about.trim(),
            fullname: fullname.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            query: query.trim()
        });

        return res.status(201).json({
            success: true,
            message: 'Your message has been received.',
            data: {
                id: savedMessage._id,
                createdAt: savedMessage.createdAt
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('Failed to save contact message.', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save your message. Please try again later.'
        });
    }
};

module.exports = { createMessage };

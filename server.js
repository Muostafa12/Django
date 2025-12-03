const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding_invitation')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Guest Schema - for RSVP
const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  attending: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  numberOfGuests: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Guest = mongoose.model('Guest', guestSchema);

// API Routes

// Submit RSVP
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, attending, numberOfGuests, message } = req.body;

    if (!name || !attending) {
      return res.status(400).json({
        success: false,
        message: 'الاسم وتأكيد الحضور مطلوبان'
      });
    }

    const guest = new Guest({
      name,
      attending,
      numberOfGuests: attending === 'yes' ? numberOfGuests : 0,
      message
    });

    await guest.save();

    const responseMessage = attending === 'yes'
      ? 'شكراً لتأكيد حضورك! نتطلع لرؤيتك 🎉'
      : 'شكراً لردك، سنفتقدك! 💝';

    res.status(201).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ، يرجى المحاولة مرة أخرى'
    });
  }
});

// Get RSVP statistics (for admin)
app.get('/api/stats', async (req, res) => {
  try {
    const totalGuests = await Guest.countDocuments();
    const attending = await Guest.countDocuments({ attending: 'yes' });
    const notAttending = await Guest.countDocuments({ attending: 'no' });
    const totalAttendees = await Guest.aggregate([
      { $match: { attending: 'yes' } },
      { $group: { _id: null, total: { $sum: '$numberOfGuests' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalGuests,
        attending,
        notAttending,
        totalAttendees: totalAttendees[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// Get all RSVPs (for admin)
app.get('/api/rsvps', async (req, res) => {
  try {
    const rsvps = await Guest.find().sort({ createdAt: -1 });
    res.json({ success: true, rsvps });
  } catch (error) {
    console.error('Get RSVPs Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching RSVPs' });
  }
});

// Serve the main page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🎊 Wedding Invitation Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});

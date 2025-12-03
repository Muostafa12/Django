/**
 * Netlify Function for RSVP Statistics
 * GET /api/stats
 */

const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
    };
  }

  try {
    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('wedding_invitation');
    const guestsCollection = db.collection('guests');

    // Get statistics
    const totalGuests = await guestsCollection.countDocuments();
    const attending = await guestsCollection.countDocuments({ attending: 'yes' });
    const notAttending = await guestsCollection.countDocuments({ attending: 'no' });

    const totalAttendeesResult = await guestsCollection
      .aggregate([
        { $match: { attending: 'yes' } },
        { $group: { _id: null, total: { $sum: '$numberOfGuests' } } },
      ])
      .toArray();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        stats: {
          totalGuests,
          attending,
          notAttending,
          totalAttendees: totalAttendeesResult[0]?.total || 0,
        },
      }),
    };
  } catch (error) {
    console.error('Stats Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Error fetching stats',
      }),
    };
  }
};

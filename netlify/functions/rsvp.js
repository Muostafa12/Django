/**
 * Netlify Function for RSVP Submission
 * POST /api/rsvp
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
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
    const body = JSON.parse(event.body);
    const { name, attending, numberOfGuests, message } = body;

    // Validation
    if (!name || !attending) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'الاسم وتأكيد الحضور مطلوبان',
        }),
      };
    }

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('wedding_invitation');
    const guestsCollection = db.collection('guests');

    // Create guest document
    const guest = {
      name: name.trim(),
      attending,
      numberOfGuests: attending === 'yes' ? (numberOfGuests || 1) : 0,
      message: message ? message.trim() : '',
      createdAt: new Date(),
    };

    // Insert into database
    await guestsCollection.insertOne(guest);

    const responseMessage =
      attending === 'yes'
        ? 'شكراً لتأكيد حضورك! نتطلع لرؤيتك 🎉'
        : 'شكراً لردك، سنفتقدك! 💝';

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: responseMessage,
      }),
    };
  } catch (error) {
    console.error('RSVP Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'حدث خطأ، يرجى المحاولة مرة أخرى',
      }),
    };
  }
};

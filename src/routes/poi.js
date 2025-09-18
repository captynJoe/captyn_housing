const express = require('express');
const { authenticateToken, authorizeRole, prisma } = require('../middleware/auth');

const router = express.Router();

// Middleware for authentication and authorization (e.g., ADMIN or LANDLORD can register POIs)
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN', 'LANDLORD']));

// POST /poi/register - Register a new POI
router.post('/register', async (req, res) => {
  const { name, description, latitude, longitude } = req.body;

  if (!name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
  }

  try {
    // Mock embedding generation (replace with actual embedding logic)
    const embedding = Array.from({ length: 128 }, () => Math.random()); // Random 128-dimensional vector

    const poi = await prisma.pOI.create({
      data: {
        name,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        embedding,
      },
    });

    res.status(201).json({ message: 'POI registered successfully', poi });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /poi - Fetch all POIs (for search or listing)
router.get('/', async (req, res) => {
  try {
    const pois = await prisma.pOI.findMany();
    res.json(pois);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

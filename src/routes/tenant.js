const express = require('express');
const { authenticateToken, authorizeRole, prisma } = require('../middleware/auth');

const router = express.Router();

// Middleware for tenant role
router.use(authenticateToken);
router.use(authorizeRole(['TENANT']));

// GET /tenant/bills - fetch rent, water, electricity
router.get('/bills', async (req, res) => {
  try {
    const tenantId = req.user.id;
    const rentPayments = await prisma.rentPayment.findMany({
      where: { tenantId, status: 'PENDING' },
    });
    const waterBills = await prisma.waterBill.findMany({
      where: { tenantId, status: 'PENDING' },
    });
    const electricityBills = await prisma.electricityBill.findMany({
      where: { tenantId, status: 'PENDING' },
    });
    res.json({ rentPayments, waterBills, electricityBills });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /tenant/pay - initiate payment (mock for now)
router.post('/pay', async (req, res) => {
  const { billId, type } = req.body; // type: 'rent', 'water', 'electricity'
  try {
    // Mock payment success
    if (type === 'rent') {
      await prisma.rentPayment.update({
        where: { id: billId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    } else if (type === 'water') {
      await prisma.waterBill.update({
        where: { id: billId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    } else if (type === 'electricity') {
      await prisma.electricityBill.update({
        where: { id: billId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }
    res.json({ message: 'Payment successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /tenant/history - fetch all payments
router.get('/history', async (req, res) => {
  try {
    const tenantId = req.user.id;
    const payments = await prisma.rentPayment.findMany({
      where: { tenantId },
    });
    const water = await prisma.waterBill.findMany({
      where: { tenantId },
    });
    const electricity = await prisma.electricityBill.findMany({
      where: { tenantId },
    });
    res.json({ payments, water, electricity });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

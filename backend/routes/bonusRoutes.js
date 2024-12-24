const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createBonus, getBonuses, updateBonus, deleteBonus, approveBonus , getUserBonuses,rejectBonus} = require('../controllers/bonusController');
const { protect, authorize } = require('../middlewares/authMiddleware');  // Import the middleware


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // This is where the files will be saved (make sure the folder exists)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Rename file to avoid conflicts
  }
});

const upload = multer({ storage });

// POST /api/bonuses (Create a bonus request with file upload)
router.post('/', protect, authorize(['manager']), upload.single('attachment'), createBonus);

// PUT /api/bonuses/:id (Update a bonus request)
router.put('/:id', protect, authorize(['manager', 'finance']), upload.single('attachment'), updateBonus);

// DELETE /api/bonuses/:id (Delete a bonus request)
router.delete('/:id', protect, authorize(['manager', 'finance']), deleteBonus);

router.put('/reject/:bonusId', protect, rejectBonus);

router.get('/', protect, getBonuses);

router.get('/my-bonuses', protect, getUserBonuses);

// PUT /api/bonuses/:id/approve (Approve a bonus request)
router.put('/:id/approve', protect, authorize(['finance', 'manager']), approveBonus);  // New approval route

module.exports = router;

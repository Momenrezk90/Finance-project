const moment = require('moment');
const Bonus = require('../models/Bonus');
const { sendApprovalEmail } = require('../services/emailService'); // Import the email service

// Get all bonuses
const getBonuses = async (req, res) => {
  try {
    let bonuses;
    if (req.user.role === 'user') {
      bonuses = await Bonus.find({ assignedTo: req.user._id });
    } else {
      bonuses = await Bonus.find();
    }
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getUserBonuses = async (req, res) => {
  try {
    const userId = req.user._id;  // Ensure this is correct
    console.log('User ID:', userId); // Debugging log
    const bonuses = await Bonus.find({ assignedTo: userId });
    res.status(200).json(bonuses);
  } catch (error) {
    console.error('Error fetching user bonuses:', error); // Log the actual error
    res.status(500).json({ message: 'Failed to fetch bonuses' });
  }
};




// Create a new bonus
const createBonus = async (req, res) => {
  const { title, reason, amount, assignedTo } = req.body;

  if (!title || !reason || !amount || !assignedTo) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Get current date and time-based restrictions
  const today = moment();
  const startOfMonth = moment().startOf('month');  // Start of current month
  const endOfMonth = moment().endOf('month');  // End of current month (last day of the month)

  // Check if the current date is within the allowed submission window (the whole month)
  if (today.isBefore(startOfMonth) || today.isAfter(endOfMonth)) {
    return res.status(400).json({ message: 'Bonus submission period has ended.' });
  }

  // Handle file attachment
  const attachment = req.file ? req.file.path : null;  // If a file is uploaded, save its path

  try {
    const newBonus = new Bonus({
      title,
      reason,
      amount,
      assignedTo,
      attachment,  // Save the attachment path in the bonus object
    });

    const bonus = await newBonus.save();
    res.status(201).json(bonus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT to update a bonus request
const updateBonus = async (req, res) => {
  const { id } = req.params;
  const { title, reason, amount, assignedTo } = req.body;

  try {
    const bonus = await Bonus.findById(id);
    if (!bonus) return res.status(404).json({ message: 'Bonus not found' });

    // Ensure the user can only update their own bonus
    if (req.user.role === 'user' && req.user._id !== bonus.assignedTo) {
      return res.status(403).json({ message: 'You can only update your own bonus' });
    }

    // Update the bonus fields
    bonus.title = title || bonus.title;
    bonus.reason = reason || bonus.reason;
    bonus.amount = amount || bonus.amount;
    bonus.assignedTo = assignedTo || bonus.assignedTo;  // Update the assigned user if provided

    // Handle file attachment update
    if (req.file) {
      bonus.attachment = req.file.path;  // Update the attachment if a new file is uploaded
    }

    const updatedBonus = await bonus.save();
    res.json(updatedBonus);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bonus' });
  }
};

// DELETE to remove a bonus request
const deleteBonus = async (req, res) => {
  const { id } = req.params;

  try {
    const bonus = await Bonus.findById(id);
    if (!bonus) return res.status(404).json({ message: 'Bonus not found' });

    // Ensure the user can only delete their own bonus
    if (req.user.role === 'user' && req.user._id !== bonus.assignedTo) {
      return res.status(403).json({ message: 'You can only delete your own bonus' });
    }

    await bonus.deleteOne();
    res.json({ message: 'Bonus deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bonus' });
  }
};


const rejectBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;

    // Find and update the bonus status to 'rejected'
    const bonus = await Bonus.findByIdAndUpdate(
      bonusId,
      { status: 'rejected' },
      { new: true } // Return the updated bonus
    );

    if (!bonus) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    res.status(200).json(bonus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject bonus' });
  }
};


// PUT to approve a bonus request
const approveBonus = async (req, res) => {
  const { id } = req.params; // Ensure the id is correctly extracted

  try {
    const bonus = await Bonus.findById(id);
    if (!bonus) return res.status(404).json({ message: 'Bonus not found' });

    bonus.status = 'approved';
    const updatedBonus = await bonus.save();

    // Optionally, send approval email
    const userEmail = bonus.assignedTo; // If assignedTo is an email, ensure it's correct
    sendApprovalEmail(userEmail, updatedBonus);

    res.json(updatedBonus);
  } catch (error) {
    res.status(500).json({ message: 'Error approving bonus' });
  }
};

module.exports = { getBonuses, createBonus, updateBonus, deleteBonus, approveBonus ,getUserBonuses , rejectBonus};

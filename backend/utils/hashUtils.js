// utils/hashUtils.js
const bcrypt = require('bcryptjs');

// Verify if the provided data matches the stored hash
const verifyHash = async (data, storedHash) => {
  try {
    const result = await bcrypt.compare(data, storedHash);
    return result;  // true if the hash matches
  } catch (error) {
    console.error('Error verifying hash:', error);
    throw new Error('Error verifying hash');
  }
};

module.exports = { verifyHash };

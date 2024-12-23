const nodemailer = require('nodemailer');

// Function to send approval email
const sendApprovalEmail = (userEmail, bonusDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testmessage90@gmail.com', // Replace with your email
      pass: 'Testmessage999'    // Replace with your email password or app password
    }
  });

  const mailOptions = {
    from: 'testmessage90@gmail.com', // Replace with your email
    to: userEmail,
    subject: 'Bonus Request Approved',
    text: `Your bonus request for "${bonusDetails.title}" has been approved.`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendApprovalEmail };

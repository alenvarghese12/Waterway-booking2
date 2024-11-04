// const express = require('express');
// const router = express.Router();
// const Booking = require('../model/bookingboat');

// // Route to handle booking creation
// router.post('/bookingss', async (req, res) => {
//   try {
//     // Create a new booking from the request body
//     const booking = new Booking(req.body);
    
//     // Save the booking to the database
//     const savedBooking = await booking.save();
    
//     // Return a success response with the saved booking
//     res.status(201).json(savedBooking);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create booking' });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Booking = require('../model/bookingboat');
const { sendBookingEmailWithPDF } = require('../controllers/emailService'); // Assuming the email PDF function is in utils folder

// Route to handle booking creation
router.post('/bookingss', async (req, res) => {
  try {
    // Extract booking details from the request body
    const { boatId, userId, startDate, endDate, adults, paymentId, name, email, phone, address, totalAmount } = req.body;

    // Create a new booking object
    const booking = new Booking({
      boatId,
      userId,
      startDate,
      endDate,
      adults,
      paymentId,
      name,
      email,
      phone,
      address,
      totalAmount,
    });

    // Save the booking to the database
    const savedBooking = await booking.save();

    // // Send booking confirmation email with the PDF attachment
    const bookingDetails = {
      boatName: booking.boatId,  // Assuming boat name is part of boat object or you might need to fetch the boat details separately
      startDate: booking.startDate,
      endDate: booking.endDate,
      adults: booking.adults,
      totalAmount: booking.totalAmount,
    };

    const userDetails = {
      name: booking.name,
      email: booking.email,
    };

    await sendBookingEmailWithPDF(userDetails, bookingDetails); // Send PDF email

    // Return a success response with the saved booking
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('Error while creating booking and sending email:', err);
    res.status(500).json({ error: 'Failed to create booking and send confirmation email.' });
  }
});

module.exports = router;

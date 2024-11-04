const Boatreg = require('../model/boatreg');

// const registerBoat = async (req, res) => {
//   try {
//     const { boatType, boatName, price, priceType, capacity, engineType, description, licenseNumber, speed, status, discountPercentage, offerDescription, location } = req.body;
//     const image = req.files?.image?.[0]?.filename;
//     const licenseDocument = req.files?.licenseDocument?.[0]?.filename;

//     // Extract the owner's ID from the token
//     const ownerId = req.user._id; // The authenticated user ID
//       const discountAmount = (price * discountPercentage) / 100;
//       const finalPrice = price - discountAmount;
//     // Create a new boat entry with ownerId
//     const newBoat = new Boatreg({
//       boatName,
//       boatType,
//       price,
//       priceType,
//       capacity,
//       engineType,
//       description,
//       licenseNumber,
//       speed,
//       status,
//       image,
//       licenseDocument,
//       discountPercentage,
//       finalPrice,
//       offerDescription,
//       location,
//       ownerId,  // Assign the ownerId from the logged-in user
//       verified: false, // Boats need to be verified by admin
//     });

//     await newBoat.save();

//     res.status(201).json({ message: 'Boat registered successfully', boat: newBoat });
//   } catch (error) {
//     console.error('Error registering boat:', error);
//     res.status(500).send({ message: 'Failed to register boat', error: error.message });
//   }
// };

// module.exports = {
//   registerBoat
// };




const registerBoat = async (req, res) => {
  try {
    const {
      boatType,
      boatName,
      price,
      priceType,
      capacity,
      engineType,
      description,
      licenseNumber,
      speed,
      status,
      discountPercentage,
      offerDescription,
      location
    } = req.body;

    // Check if files are uploaded properly
    const image = req.files?.image?.[0]?.filename;
    const licenseDocument = req.files?.licenseDocument?.[0]?.filename;

    if (!image || !licenseDocument) {
      return res.status(400).json({ message: 'Image and License Document are required.' });
    }

    // Extract the owner's ID from the token (req.user should be set by authentication middleware)
    const ownerId = req.user._id; // Ensure that authentication middleware sets req.user

    // Calculate discount and final price
    const discountAmount = (price * discountPercentage) / 100;
    const finalPrice = price - discountAmount;

    // Create a new boat entry with ownerId
    const newBoat = new Boatreg({
      boatName,
      boatType,
      price,
      priceType,
      capacity,
      engineType,
      description,
      licenseNumber,
      speed,
      status,
      image,
      licenseDocument,
      discountPercentage,
      finalPrice,
      offerDescription,
      location,
      ownerId,  // Assign the ownerId from the logged-in user
      verified: false, // Boats need to be verified by admin
    });

    // Save the new boat entry to the database
    await newBoat.save();

    // Respond with success
    res.status(201).json({ message: 'Boat registered successfully', boat: newBoat });
  } catch (error) {
    console.error('Error registering boat:', error);
    res.status(500).send({ message: 'Failed to register boat', error: error.message });
  }
};

module.exports = {
  registerBoat
};
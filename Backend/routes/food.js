const express = require('express');
const router = express.Router();
const Food = require('../model/Food');

// Add or Update Food for a Boat
router.post('/:boatId/food', async (req, res) => {
  const { boatId } = req.params;
  const { meals } = req.body; // meals for breakfast, lunch, dinner

  try {
    let food = await Food.findOne({ boatId });

    if (food) {
      // Update existing food entry
      food.meals = meals;
      await food.save();
      return res.json({ message: 'Food updated successfully', food });
    }

    // Create new food entry
    const newFood = new Food({ boatId, meals });
    await newFood.save();
    res.json({ message: 'Food added successfully', food: newFood });

  } catch (error) {
    console.error('Error adding/updating food:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Food for a Boat
router.get('/:boatId/food', async (req, res) => {
  const { boatId } = req.params;

  try {
    const food = await Food.findOne({ boatId });
    if (!food) {
      return res.status(404).json({ message: 'Food options not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

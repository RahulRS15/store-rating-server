const Store = require('../model/Store');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('ratings.user', 'name email');
    res.status(200).json({ success: true, stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createStore = async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
    let storeExists = await Store.findOne({ email });
    if (storeExists) {
      return res.status(400).json({ success: false, error: 'Store already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const store = new Store({ name, email, password: hashedPassword, address });

    await store.save();

    res.status(201).json({ success: true, message: 'Store created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


const loginStoreOwner = async (req, res) => {
  const { email, password } = req.body;

  try {
    const store = await Store.findOne({ email });

    if (!store) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, store.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: store._id, role: store.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      token,
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        role: store.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


const submitRating = async (req, res) => {
  const { storeId } = req.params;
  const { score } = req.body;
  const userId = req.user.id; // Get user ID from token

  try {
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Check if user has already rated the store
    const existingRating = store.ratings.find(r => r.user.toString() === userId);
    
    if (existingRating) {
      return res.status(400).json({ success: false, error: 'You have already rated this store' });
    }

    // Add the new rating
    store.ratings.push({ user: userId, score });

    // Recalculate overall rating
    store.calculateOverallRating();
    await store.save();

    res.status(201).json({ success: true, message: 'Rating submitted successfully', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const modifyRating = async (req, res) => {
  const { storeId } = req.params;
  const { score } = req.body;
  const userId = req.user.id; // Get user ID from token

  try {
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    const rating = store.ratings.find(r => r.user.toString() === userId);

    if (!rating) {
      return res.status(400).json({ success: false, error: 'You have not rated this store yet' });
    }

    // Update the rating score
    rating.score = score;

    // Recalculate overall rating
    store.calculateOverallRating();
    await store.save();

    res.status(200).json({ success: true, message: 'Rating updated successfully', store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getStores,
  createStore,
  loginStoreOwner,
  submitRating,
  modifyRating
};

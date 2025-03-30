const express = require('express');
const { getStores, submitRating, modifyRating, createStore, loginStoreOwner } = require('../controller/storeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all stores route
router.get('/',protect ,getStores);
// router.get('/', protect, getStores);

// create a new store
router.post('/auth', createStore);      

router.post('/login', loginStoreOwner);  

// Submit a rating route
router.post('/:storeId/rate', protect, submitRating);

// Modify a rating route
router.put('/:storeId/rate', protect, modifyRating);

module.exports = router;

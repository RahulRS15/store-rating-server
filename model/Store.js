const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      score: {
        type: Number,
        required: true,
      }
    }
  ],
  overallRating: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['normal', 'storeOwner', 'admin'],
    default: 'storeOwner',
  },
});

// Calculate the overall rating before saving the store
storeSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
    this.overallRating = Math.round(totalRating / this.ratings.length);
  } else {
    this.overallRating = 0;
  }
  next();
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;

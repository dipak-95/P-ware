const mongoose = require('mongoose');

const RetailerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    mappedTraderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the Trader's User document
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RetailerProfile', RetailerProfileSchema);

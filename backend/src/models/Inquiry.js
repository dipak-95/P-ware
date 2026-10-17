const mongoose = require('mongoose');

const InquiryItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const InquirySchema = new mongoose.Schema(
  {
    inquiryNumber: {
      type: Number,
      unique: true,
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [InquiryItemSchema],
    status: {
      type: String,
      enum: ['pending', 'quotation_generated'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment inquiryNumber starting from 1000
InquirySchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const lastInquiry = await this.constructor.findOne().sort({ inquiryNumber: -1 });
      this.inquiryNumber = lastInquiry && lastInquiry.inquiryNumber ? lastInquiry.inquiryNumber + 1 : 1001;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Inquiry', InquirySchema);

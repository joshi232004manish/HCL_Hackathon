import mongoose, { Schema } from 'mongoose';

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true // One cart per user
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);

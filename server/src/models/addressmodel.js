import mongoose from "mongoose";

const singleAddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
}, { _id: false }); // Optional: disable automatic _id for each address object

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    unique: true, // Ensure one document per user
  },
  addresses: [singleAddressSchema]
});

const Address = mongoose.model("Address", addressSchema);
export default Address;

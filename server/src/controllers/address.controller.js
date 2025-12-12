import User from "../models/usermodel.js";
import Address from "../models/addressmodel.js";

export const updateAddress = async (req, res) => {
  const { street, city, state, zipCode, country } = req.body;
  const userId = req.user;

  try {
    const admin = await Admin.findById(userId);
    if (!admin) return res.status(404).json({ message: "User not found" });

    let addressDoc = await Address.findOne({ user: userId });
    const newAddress = { street, city, state, zipCode, country };

    if (addressDoc) {
      // Check if the same address already exists
      const isDuplicate = addressDoc.addresses.some(
        (addr) =>
          addr.street === street &&
          addr.city === city &&
          addr.state === state &&
          addr.zipCode === zipCode &&
          addr.country === country
      );

      if (isDuplicate) {
        return res.status(409).json({ message: "Address already exists" });
      }

      // Add only if not duplicate
      addressDoc.addresses.push(newAddress);
    } else {
      // Create new document if none exists
      addressDoc = new Address({
        user: userId,
        addresses: [newAddress],
      });
    }

    await addressDoc.save();
    res.json(addressDoc);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAddress = async (req, res) => {
  const userId = req.user;

  try {
    const addressDoc = await Address.findOne({ user: userId });

    if (!addressDoc || addressDoc.addresses.length === 0) {
      return res.status(404).json({ message: "No addresses found for user" });
    }

    res.status(200).json({ addresses: addressDoc.addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
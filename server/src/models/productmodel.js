import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
	title: {
		type: String,
		required: [true, "product name is required"],
		trim: true,
	},
	description: {
		type: String,
		required: [true, "product description is required"],
	},
	includes: {
		type: [String],
		default: [],
	},
	price: {
		type: Number,
		required: [true, "Product price is required"],
	},
	category: {
		type: String,
		enum: ['Health Products', 'Education Products', 'Agriculture Products', 'Safety Products'],
		required: [true, "Product categaory is required"],
	},
	imageUrls: {
		type: [String],
		default: [],
		// required : [true, "Product image is required"],
	},

	stock: {
		type: Number,
	},
	discount: {
		type: Number,
		default: 0,
	},
	isLaunchingSoon: {
		type: Boolean,
		default: false,
	},
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

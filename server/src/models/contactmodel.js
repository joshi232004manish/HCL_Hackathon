import mongoose, { Schema } from 'mongoose';

const contactSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        // match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],    
    },
    name: {
        type: String,
        required: [true, "Applicant name is required"],
        trim: true,
    },
   
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        // match: [/^[0-9]{10,15}$/, "Please enter a valid mobile number"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        // minlength: [10, "Message should be at least 10 characters"],
    }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);

import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', 'prefer-not-to-say'] 
  },
  livingStatus: { 
    type: String, 
    enum: ['single', 'couple', 'family', 'shared', 'other'] 
  },
  privacySettings: {
    showBio: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    showDateOfBirth: { type: Boolean, default: false },
    showGender: { type: Boolean, default: true },
    showLivingStatus: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema); 
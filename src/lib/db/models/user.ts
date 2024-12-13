import mongoose, { Schema, Document, UpdateQuery } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  livingStatus?: 'single' | 'couple' | 'family' | 'shared' | 'other';
  isProfileComplete: boolean;
  privacySettings: {
    showBio: boolean;
    showLocation: boolean;
    showDateOfBirth: boolean;
    showGender: boolean;
    showLivingStatus: boolean;
  };
}

const userSchema = new Schema<IUser>({
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
  isProfileComplete: {
    type: Boolean,
    default: false,
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

// Fix type issues in the middleware
userSchema.pre(['save', 'findOneAndUpdate'], function(next) {
  if (this instanceof mongoose.Query) {
    const update = this.getUpdate() as UpdateQuery<IUser>;
    if (update && typeof update === 'object' && !Array.isArray(update)) {
      const updateData = update.$set || update;
      
      const isComplete = Boolean(
        updateData.location &&
        updateData.dateOfBirth &&
        updateData.gender &&
        updateData.livingStatus
      );
      
      if (update.$set) {
        update.$set.isProfileComplete = isComplete;
      } else {
        update.isProfileComplete = isComplete;
      }
    }
  } else {
    const doc = this as IUser;
    doc.isProfileComplete = Boolean(
      doc.location &&
      doc.dateOfBirth &&
      doc.gender &&
      doc.livingStatus
    );
  }
  next();
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 
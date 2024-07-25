const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// Method for comparing passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Password comparison failed');
  }
};

// Static method for aggregation
UserSchema.statics.aggregateUserRoles = async function() {
  try {
    const result = await this.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    return result;
  } catch (err) {
    throw new Error('Aggregation failed');
  }
};

module.exports = mongoose.model('User', UserSchema);

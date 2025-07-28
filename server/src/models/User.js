import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongooseEncryption from 'mongoose-encryption';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['admin', 'project_lead', 'developer'],
      default: 'developer'
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  },
  { timestamps: true }
);

/* ---------- Hash password ---------- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (cand) {
  return bcrypt.compare(cand, this.password);
};

/* ---------- Field-level encryption ---------- */
userSchema.plugin(mongooseEncryption, {
  encryptionKey: process.env.ENC_KEY,
  signingKey: process.env.SIG_KEY,
  encryptedFields: ['mfaSecret']
});

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold'],
      default: 'active'
    },
    lead: { type: mongoose.Types.ObjectId, ref: 'User' },
    assignedDevelopers: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Types.ObjectId, ref: 'Project', required: true },
    path: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: String,
    size: Number,
    uploadedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
  },
  { timestamps: { createdAt: 'uploadedAt' } }
);

export default mongoose.model('Document', documentSchema);

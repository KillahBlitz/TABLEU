import mongoose from 'mongoose';

const epicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      default: '#00E5FF'
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed'],
      default: 'planning'
    },
    startDate: {
      type: Date
    },
    targetDate: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Epic = mongoose.model('Epic', epicSchema);

export default Epic;

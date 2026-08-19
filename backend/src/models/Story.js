import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    isImage: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const storySchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['tarea', 'historia', 'hito', 'bug', 'mejora'],
      default: 'tarea'
    },
    epicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Epic',
      default: null
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'to_be_tested', 'ready_qa'],
      default: 'backlog'
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    loggedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    difficulty: {
      type: Number,
      enum: [1, 2, 3, 5, 8, 13],
      default: 1
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedReason: {
      type: String,
      trim: true,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    },
    attachments: [attachmentSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

storySchema.index({ sprintId: 1, status: 1 });
storySchema.index({ epicId: 1 });
storySchema.index({ assignedTo: 1 });
storySchema.index({ category: 1 });

const Story = mongoose.model('Story', storySchema);

export default Story;

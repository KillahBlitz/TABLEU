import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#00E5FF'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;

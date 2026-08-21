import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: '' },
    originalName: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['image', 'note'], default: 'note' },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 260 },
    height: { type: Number, default: 180 },
    content: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    originalName: { type: String, default: '' },
    title: { type: String, default: '' },
    color: { type: String, default: '#FF7D8A' },
    zIndex: { type: Number, default: 1 }
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    fromNodeId: { type: String, required: true },
    toNodeId: { type: String, required: true },
    fromHandle: { type: String, enum: ['top', 'right', 'bottom', 'left', 'auto'], default: 'auto' },
    toHandle: { type: String, enum: ['top', 'right', 'bottom', 'left', 'auto'], default: 'auto' },
    color: { type: String, default: '#00E5FF' },
    label: { type: String, default: '' },
    style: { type: String, default: 'curved' }
  },
  { _id: false }
);

const sitemapSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    library: [assetSchema],
    viewport: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 }
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Sitemap = mongoose.model('Sitemap', sitemapSchema);

export default Sitemap;

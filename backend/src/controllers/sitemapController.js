import Sitemap from '../models/Sitemap.js';

export const getSitemap = async (_req, res) => {
  try {
    let sitemap = await Sitemap.findOne({ key: 'main' })
      .populate('updatedBy', 'name email avatarColor');

    if (!sitemap) {
      sitemap = await Sitemap.create({
        key: 'main',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      });
    }

    return res.json(sitemap);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSitemap = async (req, res) => {
  try {
    const { nodes, edges, viewport } = req.body;

    let sitemap = await Sitemap.findOne({ key: 'main' });

    if (!sitemap) {
      sitemap = new Sitemap({ key: 'main' });
    }

    if (nodes !== undefined) {
      sitemap.nodes = nodes;
    }
    if (edges !== undefined) {
      sitemap.edges = edges;
    }
    if (viewport !== undefined) {
      sitemap.viewport = viewport;
    }

    sitemap.updatedBy = req.user._id;
    await sitemap.save();

    const populated = await Sitemap.findById(sitemap._id)
      .populate('updatedBy', 'name email avatarColor');

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadSitemapImage = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/uploads/${file.filename}`
    }));

    return res.json({
      success: true,
      files: uploadedFiles,
      file: uploadedFiles[0]
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const clearSitemap = async (req, res) => {
  try {
    let sitemap = await Sitemap.findOne({ key: 'main' });
    if (!sitemap) {
      sitemap = new Sitemap({ key: 'main' });
    }

    sitemap.nodes = [];
    sitemap.edges = [];
    sitemap.updatedBy = req.user._id;
    await sitemap.save();

    return res.json({ message: 'Sitemap cleared successfully', sitemap });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

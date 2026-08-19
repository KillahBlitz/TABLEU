import Role from '../models/Role.js';

export const getRoles = async (_req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, label, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({
      name: name.trim(),
      label: label ? label.trim() : name.trim(),
      color: color || '#00E5FF',
      description: description || ''
    });

    return res.status(201).json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { label, color, description } = req.body;
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (label !== undefined) role.label = label;
    if (color !== undefined) role.color = color;
    if (description !== undefined) role.description = description;

    await role.save();
    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

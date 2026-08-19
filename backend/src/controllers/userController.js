import User from '../models/User.js';
import Story from '../models/Story.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete administrator accounts' });
    }

    await Story.updateMany({ assignedTo: userToDelete._id }, { assignedTo: null });
    await User.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Developer account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { jobRole, role, requiredHours } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (jobRole !== undefined) {
      user.jobRole = jobRole;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (requiredHours !== undefined) {
      user.requiredHours = Math.max(0, Number(requiredHours) || 0);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

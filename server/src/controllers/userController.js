import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
// Get all developers - for admin & project_lead
export const getDevelopers = asyncHandler(async (req, res) => {
    if (!['admin', 'project_lead'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    const developers = await User.find({ role: 'developer' }).select('-password -mfaSecret');
    res.json({ users: developers });
  });
  
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -mfaSecret');
  res.json({ users });
});

export const getRecentUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(5); // or whatever number you want

  res.status(200).json({ users });
});


export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  }).select('-password -mfaSecret');
  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

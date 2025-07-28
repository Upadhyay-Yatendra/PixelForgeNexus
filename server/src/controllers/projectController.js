import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().populate('lead', 'username email');
  res.json({ projects });
});

export const myProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    assignedDevelopers: req.user._id
  });
  res.json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('lead', 'username email')
    .populate('assignedDevelopers', 'username email');
  res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

/* ---------- Assignment ---------- */
export const assignDev = asyncHandler(async (req, res) => {
  const { developerId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project.assignedDevelopers.includes(developerId))
    project.assignedDevelopers.push(developerId);
  await project.save();
  res.json({ project });
});

export const removeDev = asyncHandler(async (req, res) => {
  const { devId } = req.params;
  await Project.findByIdAndUpdate(req.params.id, {
    $pull: { assignedDevelopers: devId }
  });
  res.status(204).send();
});

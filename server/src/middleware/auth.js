import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';

export const protect = asyncHandler(async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken)
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Not logged in' });

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('+password');
    if (!req.user) throw new Error();
    next();
  } catch {
    res.clearCookie('accessToken');
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
});

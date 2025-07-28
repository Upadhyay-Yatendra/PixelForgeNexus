import asyncHandler from 'express-async-handler';
import Joi from 'joi';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import { validator } from '../middleware/validate.js';
import { sendToken } from '../utils/generateTokens.js';
import { authLimiter } from '../middleware/rateLimiter.js';

/* ---------- Validation Schemas ---------- */

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const validateLogin = validator.body(loginSchema);

/* ---------- Register (Admin only) ---------- */

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await User.create({ username, email, password, role });
  res.status(201).json({ user });
});

/* ---------- Login ---------- */
export const login = [
  authLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    // console.log("/n",username, "/n",password)
    const user = await User.findOne({ username }).select('+password +mfaSecret');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    // MFA
    if (user.mfaEnabled) {
      const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '5m'
      });
      return res.json({ requiresMFA: true, tempToken });
    }

    user.lastLogin = new Date();
    await user.save();
    sendToken(user, res);
  })
];

/* ---------- Verify MFA ---------- */
export const verifyMFA = asyncHandler(async (req, res) => {
  const { tempToken, mfaToken } = req.body;
  const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+mfaSecret');

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: mfaToken,
    window: parseInt(process.env.MFA_WINDOW, 10)
  });

  if (!verified) return res.status(400).json({ error: 'Invalid MFA code' });

  user.lastLogin = new Date();
  await user.save();
  sendToken(user, res);
});

/* ---------- Setup MFA ---------- */
export const setupMFA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `PixelForge Nexus (${req.user.email})`
  });
  req.user.mfaSecret = secret.base32;
  await req.user.save();

  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ qrCode: qr.split(',')[1], secret: secret.base32 });
});

/* ---------- Confirm MFA ---------- */
export const confirmMFA = asyncHandler(async (req, res) => {
  const { secret, token } = req.body;
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token
  });
  if (!verified) return res.status(400).json({ error: 'Invalid code' });

  req.user.mfaEnabled = true;
  await req.user.save();
  res.json({ success: true });
});

/* ---------- Disable MFA ---------- */
export const disableMFA = asyncHandler(async (req, res) => {
  req.user.mfaEnabled = false;
  req.user.mfaSecret = undefined;
  await req.user.save();
  res.json({ success: true });
});

/* ---------- Logout ---------- */
export const logout = (req, res) => {
  res.clearCookie('accessToken').json({ success: true });
};

/* ---------- Current User ---------- */
export const currentUser = (req, res) => {
  res.json({ user: req.user });
};

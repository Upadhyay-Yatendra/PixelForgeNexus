import jwt from "jsonwebtoken";

export const sendToken = (user, res, statusCode = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res
    .status(statusCode)
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
};

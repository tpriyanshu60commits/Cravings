import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

export const genToken = async (user, res) => {
  const payload = { id: user._id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("oreo", token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

export const genOTPToken = async (user, res) => {
  const payload = { id: user._id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  res.cookie("kitkat", token, {
    maxAge: 1000 * 60 * 10,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};
import jwt from "jsonwebtoken";

const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  // If no access token, try to refresh
  console.log("Access token:", token);
  if (!token) {
    // res.json({ message: "No access token found, trying to refresh..." });
    return refreshAccessToken(req, res, next);
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded.id;
    next();
    // res.json(decoded);
    // res.json(decoded.id);
    
  } catch (err) {
    if (err.name === "TokenExpiredError") {
        return refreshAccessToken(req, res, next); // try to refresh
      }
      return res.status(403).json({ message: "Invalid access token" });
  }
  

  
    
};

const refreshAccessToken = (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(406).json({ message: "Refresh token not found" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    console.log("Decoded refresh token:", decoded);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000 
    });

    req.user = decoded.id;
    next();
  });
};

export default verifyAccessToken;

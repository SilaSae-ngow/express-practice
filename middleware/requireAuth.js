const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

module.exports = requireAuth;

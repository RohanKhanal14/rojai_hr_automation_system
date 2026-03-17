//Imports
import jwt from "jsonwebtoken";
//Middleware
const protectLogin = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    //No Access Token
    if (!accessToken) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).send({
          message: "Must login to access the system!",
          success: false,
        });
      }
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_TOKEN_SECRET,
        );
        const newAccessToken = jwt.sign(
          { email: payload.email, role: payload.role },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
          secure: process.env.ENVIRONMENT === "production",
          sameSite: "strict",
        });
        req.user = { email: payload.email, role: payload.role };
        return next();
      } catch (_) {
        return res
          .status(401)
          .send({ message: "Invalid Token Received!", success: false });
      }
    }
    //Access Token Exists
    try {
      const payload = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );
      req.user = { email: payload.email, role: payload.role };
      return next();
    } catch (_) {
      return res
        .status(401)
        .send({ message: "Invalid Token Received!", success: false });
    }
  } catch (error) {
    console.error("Internal Server Error!", error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error!", success: false });
  }
};
//Export
export default protectLogin;

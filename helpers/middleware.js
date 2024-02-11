import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/user.js";

export const checkTokenMiddleware = (req, res, next) => {
  const Authorization = req.headers.authorization;

if (typeof Authorization === "undefined") {
    return res.status(401).json({ message: "Not authorized A" });
  }
  const [bearer, token] = Authorization.split(" ", 2);

if (bearer != "Bearer") {
    return res.status(401).json({ message: "Not authorized B" });
  }

jsonwebtoken.verify(token, process.env.JWT_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Not authorized C" });
    }
    const user = await User.findById(decoded.id);
    if (user === null) {
      return res.status(401).json({ message: "Not authorized D" });
    }
    if (user.token != token) {
       return res.status(401).json({ message: "Not authorized E" });
    }
    req.user = { id: decoded.id };
    next();
  });
};

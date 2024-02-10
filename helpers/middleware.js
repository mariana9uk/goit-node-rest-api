import jsonwebtoken from "jsonwebtoken";
export const checkTokenMiddleware = (req, res, next) => {
  const Authorization = req.headers.authorization;

  if (typeof Authorization === "undefined") {
    return res.status(401).json({ message: "Not authorized" });
  }
  console.log(Authorization);
  const [bearer, token] = Authorization.split(" ", 2);

  if (bearer != "Bearer") {
    return res.status(401).json({ message: "Not authorized" });
  }
  jsonwebtoken.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Not authorized" });
    }

    console.log(decoded)
    req.user={id: decoded.id}
    
    next()
  });

};

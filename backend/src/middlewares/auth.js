// middlewares/auth.js
import jwt from 'jsonwebtoken';

export const verificarAuth = (req, res, next) => {
    const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
   try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ msg: 'Token inválido' });
    }
};

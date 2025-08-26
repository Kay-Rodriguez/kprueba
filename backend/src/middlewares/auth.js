import jwt from 'jsonwebtoken';


export const verificarAuth = (req, res, next) => {
const token = (req.headers.authorization || '').replace('Bearer ', '');
if (!token) return res.status(401).json({ msg: 'Acceso denegado' });
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload;
next();
} catch (e) {
return res.status(401).json({ msg: 'Token inválido' });
}
};

import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split("")[1];

    if (!token) {
        return res.status(401).json({ message: "Toke inválido" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return res.status(200).json({ message: "Acesso permitido!", user: decoded });
    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}
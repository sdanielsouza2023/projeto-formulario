import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool(
    {
        connectionString: process.env.DATABASE_URL,
    }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método não permitido" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Usuário ou senha incorretos" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Usuário ou senha incorretos" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        return res.status(200).json({ message: "Login bem-sucedido", token });
    } catch (error) {
        console.error("Erro no login", error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }


}
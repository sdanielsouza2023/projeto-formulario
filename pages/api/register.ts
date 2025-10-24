import type { NextApiResponse, NextApiRequest } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método não permitido" });
    }

    const { name, email, password } = req.body;



    if (!email || !password) {
        return res.status(400).json({ message: "Email e são obrigatórios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ mesasge: "Formato de email inválido" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "A senha deve ter no mínimo 8 caracteres, conter pelo menos uma letra e um número",

        });
    }


    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        return res.status(201).json({ message: "Usuário cadastrado com sucesso", user });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return res.status(500).json({ message: "Erro interno no Servidor" });
    }
}


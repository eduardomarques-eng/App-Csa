import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../infrastructure/auth/AuthService";
import db from "../../infrastructure/database/sqlite";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email) as any;

      if (
        !user ||
        !(await AuthService.comparePassword(password, user.password_hash))
      ) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const tokens = AuthService.generateTokens(user);
      res.json({ ...tokens, user: { email: user.email, role: user.role } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const id = Math.random().toString(36).substr(2, 9);
      const hash = await AuthService.hashPassword(password);

      db.prepare(
        "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ).run(id, email, hash, "user");

      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erro ao criar usuário. Email já existe?" });
    }
  }
}

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_cambialo';

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
interface LoginResult {
    token: string;
    rol: Role;
    referenciaId: number;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
    const usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
            id: true,
            rol: true,
            contrasena_hash: true,
            secretario_id: true,
            pastor_id: true,
            miembro_id: true,
        },
    });
    if (!usuario) {
        throw new Error("Credenciales inválidas (Usuario no encontrado)");
    }
    const passwordMatch = await comparePassword(password, usuario.contrasena_hash);
    if (!passwordMatch) {
        throw new Error("Credenciales inválidas (Contraseña incorrecta)");
    }
    let referenciaId: number | null = null;

    switch (usuario.rol) {
        case Role.Secretario:
            referenciaId = usuario.secretario_id;
            break;
        case Role.Pastor:
            referenciaId = usuario.pastor_id;
            break;
        case Role.Miembro:
            referenciaId = usuario.miembro_id;
            break;
    }

    if (referenciaId === null || referenciaId === undefined) {
        throw new Error("Error interno: Perfil de usuario no encontrado o mal enlazado.");
    }
    const payload = {
        id: usuario.id,
        rol: usuario.rol,
        referenciaId: referenciaId,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Token válido por 8 horas
    return {
        token,
        rol: usuario.rol,
        referenciaId: referenciaId,
    };
};
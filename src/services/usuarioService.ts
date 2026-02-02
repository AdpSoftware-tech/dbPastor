// src/services/usuarioService.ts
import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();

// Función interna para hashear password
const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

export type CrearUsuarioInput = {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    password: string;
    rol: Rol;                 // "PASTOR", "MIEMBRO", "SECRETARIAAsociacion", etc.
    codigoUnico: string;      // Por ejemplo: "PST-0001", "SEC-001", etc.
    asociacionId?: string | null; // Solo para SECRETARIAAsociacion
    iglesiaId?: string | null;    // Solo para SECRETARIAIglesia
};

export const crearUsuario = async (data: CrearUsuarioInput) => {
    const {
        nombre,
        apellidos,
        email,
        telefono,
        password,
        rol,
        codigoUnico,
        asociacionId,
        iglesiaId
    } = data;

    // 1. Validaciones básicas
    if (!nombre || !apellidos || !email || !telefono || !password || !codigoUnico) {
        throw new Error("Nombre, apellidos, email, teléfono, password y código único son obligatorios.");
    }

    // 2. Verificar que email, teléfono y código único NO estén usados
    const [existeEmail, existeTelefono, existeCodigo] = await Promise.all([
        prisma.usuario.findUnique({ where: { email } }),
        prisma.usuario.findUnique({ where: { telefono } }),
        prisma.usuario.findUnique({ where: { codigoUnico } })
    ]);

    if (existeEmail) throw new Error("Ya existe un usuario con este email.");
    if (existeTelefono) throw new Error("Ya existe un usuario con este teléfono.");
    if (existeCodigo) throw new Error("Ya existe un usuario con este código único.");

    // 3. Validar asociaciones solo para roles de secretaria
    let extraData: any = {};

    if (rol === "SECRETARIAAsociacion") {
        if (!asociacionId) {
            throw new Error("La secretaria de asociación debe tener asociacionId.");
        }
        const asoc = await prisma.asociacion.findUnique({ where: { id: asociacionId } });
        if (!asoc) throw new Error("La asociación indicada no existe.");
        extraData.asociacionId = asociacionId;
    }

    if (rol === "SECRETARIAIglesia") {
        if (!iglesiaId) {
            throw new Error("La secretaria de iglesia debe tener iglesiaId.");
        }
        const igl = await prisma.iglesia.findUnique({ where: { id: iglesiaId } });
        if (!igl) throw new Error("La iglesia indicada no existe.");
        extraData.iglesiaId = iglesiaId;
    }

    // 4. Hashear contraseña
    const passwordHash = await hashPassword(password);

    // 5. Crear el usuario
    const usuario = await prisma.usuario.create({
        data: {
            nombre,
            apellidos,
            email,
            telefono,
            password: passwordHash,
            rol,
            codigoUnico,
            ...extraData
        },
        select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
            telefono: true,
            rol: true,
            codigoUnico: true,
            asociacionId: true,
            iglesiaId: true
        }
    });

    return usuario;
};

export const getAllUsuariosService = async () => {
    const usuarios = await prisma.usuario.findMany({
        select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
            telefono: true,
            rol: true,
            codigoUnico: true,
            creadoEn: true,
            actualizadoEn: true,
        },
        orderBy: { creadoEn: "desc" },
    });

    const totalUsuarios = await prisma.usuario.count();

    const porRolRaw = await prisma.usuario.groupBy({
        by: ["rol"],
        _count: { rol: true },
    });

    const porRol: Record<string, number> = {};
    for (const r of porRolRaw) porRol[r.rol] = r._count.rol;

    // ✅ Nuevos por mes
    const nuevosPorMes = await prisma.$queryRaw<
        Array<{ mes: string; cantidad: bigint }>
    >`
    SELECT to_char(date_trunc('month', "creadoEn"), 'YYYY-MM') as mes,
           count(*)::bigint as cantidad
    FROM "Usuario"
    GROUP BY 1
    ORDER BY 1 ASC
  `;

    return {
        usuarios,
        stats: {
            totalUsuarios,
            porRol,
            nuevosPorMes: nuevosPorMes.map((x) => ({
                mes: x.mes, // "2026-01"
                cantidad: Number(x.cantidad),
            })),
        },
    };
};




import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


/**
 * 1. Obtener el perfil de la iglesia asignada a la secretaria.
 * La secretaria está vinculada a la iglesia a través del campo 'iglesiaId' en el modelo Usuario.
 * Por lo tanto, necesitamos el usuarioId para buscar su perfil de Secretaria.
 */
export const getIglesiaPerfil = async (usuarioId: string) => {
    // 1. Encontrar el registro del usuario (Secretaria) para obtener el iglesiaId
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Buscar la información completa de la iglesia usando el iglesiaId
    return prisma.iglesia.findUnique({
        where: { id: usuario.iglesiaId },
        include: {
            distrito: {
                include: { asociacion: true }
            },
            pastor: {
                include: {
                    usuario: {
                        select: { nombre: true, apellidos: true, telefono: true }
                    }
                }
            }
        }
    });
};

/**
 * 2. Obtener todos los miembros de la iglesia asignada.
 */
export const getMiembrosIglesia = async (usuarioId: string) => {
    // 1. Encontrar la iglesiaId de la secretaria
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Buscar todos los miembros que pertenezcan a esa iglesia
    return prisma.miembro.findMany({
        where: { iglesiaId: usuario.iglesiaId },
        include: {
            usuario: {
                select: { id: true, nombre: true, apellidos: true, email: true, telefono: true }
            }
        }
    });
};

/**
 * 3. Crear un nuevo evento para la iglesia asignada.
 * NOTA: La secretaria es el 'creadoPor'
 */
export const crearEventoIglesia = async (usuarioId: string, data: any) => {
    const { nombre, descripcion, fechaInicio, fechaFin, lugar } = data;

    // 1. Encontrar la iglesiaId de la secretaria
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Crear el evento
    return prisma.evento.create({
        data: {
            nombre,
            descripcion,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            lugar,
            iglesiaId: usuario.iglesiaId, // Asignar a la iglesia de la secretaria
            creadoPorId: usuarioId // Asignar a la secretaria como creadora
        }
    });
};



type CrearIglesiaDTO = {
    nombre: string;
    codigo: string;
    direccion: string;
    telefono?: string | null;
    distritoId: string;
    pastorId?: string | null; // opcional
};

export const crearIglesiaService = async (body: CrearIglesiaDTO) => {
    const nombre = (body.nombre ?? "").trim();
    const codigo = (body.codigo ?? "").trim();
    const direccion = (body.direccion ?? "").trim();
    const telefono = body.telefono ?? null;
    const distritoId = (body.distritoId ?? "").trim();
    const pastorId = body.pastorId ?? null;

    if (!nombre || !codigo || !direccion || !distritoId) {
        throw new Error("nombre, codigo, direccion y distritoId son obligatorios.");
    }

    // ✅ validar distrito exista
    const distrito = await prisma.distrito.findUnique({ where: { id: distritoId } });
    if (!distrito) throw new Error("El distritoId no existe.");

    // ✅ validar codigo único
    const existeCodigo = await prisma.iglesia.findUnique({ where: { codigo } });
    if (existeCodigo) throw new Error("Ya existe una iglesia con este código.");

    // (opcional) validar pastor exista si viene
    if (pastorId) {
        const pastor = await prisma.pastor.findUnique({ where: { id: pastorId } });
        if (!pastor) throw new Error("El pastorId no existe.");
    }

    return prisma.iglesia.create({
        data: {
            nombre,
            codigo,
            direccion,
            telefono,
            distritoId,
            pastorId,
        },
        include: {
            distrito: { include: { asociacion: true } },
            pastor: { include: { usuario: true } },
        },
    });
};

export const getAllIglesiasService = async () => {
    return prisma.iglesia.findMany({
        orderBy: { nombre: "asc" },
        include: {
            distrito: { include: { asociacion: true } },
            pastor: { include: { usuario: true } },
            _count: { select: { miembros: true, eventos: true } },
        },
    });
};

export const editarIglesiaService = async (id: string, body: Partial<CrearIglesiaDTO>) => {
    const existe = await prisma.iglesia.findUnique({ where: { id } });
    if (!existe) throw new Error("Iglesia no existe.");

    if (body.distritoId) {
        const distrito = await prisma.distrito.findUnique({ where: { id: body.distritoId } });
        if (!distrito) throw new Error("El distritoId no existe.");
    }

    if (body.codigo && body.codigo !== existe.codigo) {
        const dup = await prisma.iglesia.findUnique({ where: { codigo: body.codigo } });
        if (dup) throw new Error("Ya existe una iglesia con este código.");
    }

    if (body.pastorId) {
        const pastor = await prisma.pastor.findUnique({ where: { id: body.pastorId } });
        if (!pastor) throw new Error("El pastorId no existe.");
    }

    return prisma.iglesia.update({
        where: { id },
        data: {
            ...(body.nombre ? { nombre: body.nombre.trim() } : {}),
            ...(body.codigo ? { codigo: body.codigo.trim() } : {}),
            ...(body.direccion ? { direccion: body.direccion.trim() } : {}),
            ...(body.telefono !== undefined ? { telefono: body.telefono } : {}),
            ...(body.distritoId ? { distritoId: body.distritoId } : {}),
            ...(body.pastorId !== undefined ? { pastorId: body.pastorId } : {}),
        },
        include: {
            distrito: { include: { asociacion: true } },
            pastor: { include: { usuario: true } },
        },
    });
};

export const eliminarIglesiaService = async (id: string) => {
    const existe = await prisma.iglesia.findUnique({ where: { id } });
    if (!existe) throw new Error("Iglesia no existe.");

    // ⚠️ si tienes dependencias (miembros/eventos), Prisma puede bloquear.
    // Puedes:
    // - impedir eliminar si hay miembros/eventos
    // - o borrar en cascada (depende tu schema y lógica)
    const counts = await prisma.iglesia.findUnique({
        where: { id },
        select: { _count: { select: { miembros: true, eventos: true } } },
    });

    if ((counts?._count.miembros ?? 0) > 0) {
        throw new Error("No se puede eliminar: la iglesia tiene miembros.");
    }
    if ((counts?._count.eventos ?? 0) > 0) {
        throw new Error("No se puede eliminar: la iglesia tiene eventos.");
    }

    await prisma.iglesia.delete({ where: { id } });
};

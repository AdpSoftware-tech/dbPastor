import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CrearPastorInput = {
    usuarioId: string;
    licenciaPastoral?: string | null;
    fechaOrdenacion?: Date | string | null;
    asociacionId?: string | null;
    distritoId?: string | null;
};


/**
 * 1. Obtener perfil del pastor
 */
export const getPastorPerfil = async (pastorInfoId: string) => {
    return prisma.pastor.findUnique({
        where: { id: pastorInfoId },
        include: {
            usuario: {
                select: {
                    id: true,
                    nombre: true,
                    apellidos: true,
                    email: true,
                    telefono: true,
                    rol: true
                }
            },
            asociacion: true,
            distrito: true
        }
    });
};

/**
 * 2. Obtener iglesias asignadas al pastor
 */
export const getPastorIglesias = async (pastorInfoId: string) => {
    const pastor = await prisma.pastor.findUnique({
        where: { id: pastorInfoId },
        select: { distritoId: true }
    });

    if (!pastor || !pastor.distritoId) {
        throw new Error("El pastor no tiene distrito asignado");
    }

    return prisma.iglesia.findMany({
        where: { distritoId: pastor.distritoId }
    });
};


/**
 * 3. Obtener los miembros de las iglesias del pastor
 */
export const getPastorMiembros = async (pastorInfoId: string) => {
    const pastor = await prisma.pastor.findUnique({
        where: { id: pastorInfoId },
        select: { distritoId: true }
    });

    if (!pastor || !pastor.distritoId) {
        throw new Error("El pastor no tiene distrito asignado");
    }

    return prisma.miembro.findMany({
        where: {
            iglesia: {
                distritoId: pastor.distritoId
            }
        },
        include: {
            iglesia: true,
            usuario: true
        }
    });
};


/**
 * 4. Registrar un bautismo
 */
export const registrarBautismo = async (pastorInfoId: string, data: any) => {
    const { miembroId, fecha, lugar } = data;

    return prisma.bautismo.create({
        data: {
            miembroId,
            pastorId: pastorInfoId,
            fecha: new Date(fecha),
        }
    });
};

/**
 * 5. Obtener todos los bautismos registrados por el pastor
 */
export const getPastorBautismos = async (pastorInfoId: string) => {
    return prisma.bautismo.findMany({
        where: { pastorId: pastorInfoId },
        include: {
            miembro: {
                include: { usuario: true }
            }
        }
    });
};

/**
 * Asignar pastor a un distrito
 */
export const asignarPastorADistrito = async ({
    pastorId,
    usuarioId,
    distritoId,
}: {
    pastorId?: string;
    usuarioId?: string;
    distritoId: string;
}) => {
    // 1) Validar distrito
    const distrito = await prisma.distrito.findUnique({
        where: { id: distritoId },
    });

    if (!distrito) throw new Error("El distrito no existe.");

    // 2) Validar que exista pastor (por id o por usuarioId)
    const where = pastorId
        ? { id: pastorId }
        : { usuarioId: usuarioId! }; // usuarioId viene obligatorio si no hay pastorId

    const existe = await prisma.pastor.findUnique({ where });

    if (!existe) {
        throw new Error("No existe pastor para este usuario.");
    }

    // 3) Actualizar y sincronizar asociación
    return prisma.pastor.update({
        where,
        data: {
            distritoId,
            asociacionId: distrito.asociacionId, // ✅ se sincroniza automáticamente
        },
    });
};


/**
 * Quitar pastor del distrito
 */
export const quitarPastorDeDistrito = async (pastorId: string) => {
    return prisma.pastor.update({
        where: { id: pastorId },
        data: { distritoId: null }
    });
};

/**
 * Mover pastor a otro distrito
 */
export const moverPastorDeDistrito = async (pastorId: string, nuevoDistritoId: string) => {
    const distrito = await prisma.distrito.findUnique({
        where: { id: nuevoDistritoId }
    });

    if (!distrito) {
        throw new Error("El distrito destino no existe.");
    }

    return prisma.pastor.update({
        where: { id: pastorId },
        data: {
            distritoId: nuevoDistritoId,
            asociacionId: distrito.asociacionId
        }
    });
};

/**
 * Pastores del distrito
 */
export const obtenerPastoresDeDistrito = async (distritoId: string) => {
    return prisma.pastor.findMany({
        where: { distritoId },
        include: {
            usuario: {
                select: { nombre: true, apellidos: true, telefono: true }
            }
        }
    });
};

/**
 * Pastores de la asociación
 */
export const obtenerPastoresDeAsociacion = async (asociacionId: string) => {
    return prisma.pastor.findMany({
        where: { asociacionId },
        include: {
            usuario: { select: { nombre: true, apellidos: true, telefono: true } },
            distrito: true
        }
    });
};
/**
 * Pastores de la asociación, todo ordenado y agrupado, no una lista plana desordenada.
 */

export const obtenerEstructuraAsociacionesPastores = async () => {
    const asociaciones = await prisma.asociacion.findMany({
        orderBy: { nombre: "asc" },
        include: {
            distritos: {
                orderBy: { nombre: "asc" },
                include: {
                    pastores: {
                        include: {
                            usuario: {
                                select: { nombre: true, apellidos: true, telefono: true, email: true }
                            }
                        }
                    }
                }
            },
            pastores: {
                include: {
                    usuario: {
                        select: { nombre: true, apellidos: true, telefono: true, email: true }
                    },
                    distrito: {
                        select: { id: true, nombre: true }
                    }
                }
            }
        }
    });

    const asociacionesMapeadas = asociaciones.map((aso) => {
        // Pastores sin distrito
        const pastoresSinDistrito = aso.pastores
            .filter((p) => !p.distritoId)
            .map((p) => ({
                id: p.id,
                usuario: p.usuario
            }));

        // Distritos con sus pastores
        const distritos = aso.distritos.map((dist) => ({
            id: dist.id,
            nombre: dist.nombre,
            cantidadPastores: dist.pastores.length,
            pastores: dist.pastores.map((p) => ({
                id: p.id,
                usuario: p.usuario
            }))
        }));

        const totalPastoresAsociacion =
            pastoresSinDistrito.length + distritos.reduce((acc, d) => acc + d.cantidadPastores, 0);

        return {
            id: aso.id,
            nombre: aso.nombre,
            cantidadDistritos: distritos.length,
            cantidadPastores: totalPastoresAsociacion,
            distritos,
            pastoresSinDistrito
        };
    });

    const totalAsociaciones = asociacionesMapeadas.length;
    const totalDistritos = asociacionesMapeadas.reduce(
        (acc, aso) => acc + aso.cantidadDistritos,
        0
    );
    const totalPastores = asociacionesMapeadas.reduce(
        (acc, aso) => acc + aso.cantidadPastores,
        0
    );

    return {
        totalAsociaciones,
        totalDistritos,
        totalPastores,
        asociaciones: asociacionesMapeadas
    };
};



/**
 * crear pastor 
 */
export const crearPastor = async ({
    usuarioId,
    licenciaPastoral,
    fechaOrdenacion,
    asociacionId,
    distritoId
}: CrearPastorInput) => {
    if (!usuarioId) {
        throw new Error("El usuarioId es obligatorio para crear un pastor.");
    }

    // 1. Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
    });

    if (!usuario) {
        throw new Error("El usuario indicado no existe.");
    }

    // 2. Verificar rol PASTOR (asumiendo que lo tienes en el enum Rol)
    if (usuario.rol !== "PASTOR") {
        throw new Error("El usuario no tiene rol PASTOR.");
    }

    // 3. Verificar que no tenga ya un registro de Pastor
    const existente = await prisma.pastor.findUnique({
        where: { usuarioId } // porque usuarioId es @unique en el modelo
    });

    if (existente) {
        throw new Error("Ya existe un pastor asociado a este usuario.");
    }

    // 4. (Opcional) Validar asociación y distrito si vienen
    if (asociacionId) {
        const asociacion = await prisma.asociacion.findUnique({
            where: { id: asociacionId }
        });
        if (!asociacion) {
            throw new Error("La asociación indicada no existe.");
        }
    }

    if (distritoId) {
        const distrito = await prisma.distrito.findUnique({
            where: { id: distritoId }
        });
        if (!distrito) {
            throw new Error("El distrito indicado no existe.");
        }
    }

    // 5. Crear el pastor
    return prisma.pastor.create({
        data: {
            usuarioId,
            licenciaPastoral: licenciaPastoral ?? null,
            fechaOrdenacion: fechaOrdenacion
                ? new Date(fechaOrdenacion)
                : null,
            asociacionId: asociacionId ?? null,
            distritoId: distritoId ?? null
        },
        include: {
            usuario: {
                select: { nombre: true, apellidos: true, telefono: true, email: true }
            },
            asociacion: true,
            distrito: true
        }
    });
};

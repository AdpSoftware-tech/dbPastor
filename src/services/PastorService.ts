import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

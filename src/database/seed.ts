
// src/database/seed.ts

import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando Seed...");
    const asociacion = await prisma.asociacion.create({
        data: {
            nombre: "Asociación Central",
        },
    });


    const distrito = await prisma.distrito.create({
        data: {
            nombre: "Distrito Norte",
            asociacionId: asociacion.id,
        },
    });


    const iglesia = await prisma.iglesia.create({
        data: {
            nombre: "Iglesia Central",
            codigo: "IGL-001",
            direccion: "Centro, Ciudad",
            telefono: "7000-0000",
            distritoId: distrito.id,
        },
    });


    const hashedPass = await bcrypt.hash("Admin123*", 10);

    const superAdmin = await prisma.usuario.create({
        data: {
            nombre: "Super",
            apellidos: "Admin",
            email: "admin@correo.com",
            telefono: "6000-0000",
            password: hashedPass,
            rol: Rol.SuperADMIN,
            codigoUnico: "SUPER-001",
        },
    });

    console.log("✔ SuperADMIN creado:", superAdmin.email);


    const pastorUser = await prisma.usuario.create({
        data: {
            nombre: "Juan",
            apellidos: "Pérez",
            email: "pastor@correo.com",
            telefono: "7100-0000",
            password: await bcrypt.hash("Pastor123*", 10),
            rol: Rol.PASTOR,
            codigoUnico: "PAST-001",
            pastorInfo: {
                create: {
                    licenciaPastoral: "LIC-12345",
                    asociacionId: asociacion.id,
                    distritoId: distrito.id,
                },
            },
        },
    });

    console.log("✔ Pastor creado:", pastorUser.email);


    const miembroUser = await prisma.usuario.create({
        data: {
            nombre: "Carlos",
            apellidos: "Ramírez",
            email: "miembro@correo.com",
            telefono: "7200-0000",
            password: await bcrypt.hash("Miembro123*", 10),
            rol: Rol.MIEMBRO,
            codigoUnico: "MIEMB-001",
            miembroInfo: {
                create: {
                    fechaNacimiento: new Date("1990-05-15"),
                    iglesiaId: iglesia.id,
                    codigoMiembro: "MBR-001",
                },
            },
        },
    });

    console.log("✔ Miembro creado:", miembroUser.email);

    console.log("🌱 Seed completado con éxito.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

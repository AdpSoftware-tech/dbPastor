// src/database/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../services/AuthService.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando el proceso de Seeding...');

    // ----------------------------------------------------
    // 1. ELIMINAR DATOS PREVIOS (Para una ejecución limpia)
    // ----------------------------------------------------
    console.log('Limpiando la base de datos...');

    // El orden es importante debido a las claves foráneas
    await prisma.citaVisita.deleteMany({});
    await prisma.oracionMiembro.deleteMany({});
    await prisma.peticionOracion.deleteMany({});
    await prisma.bautismo.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.secretario.deleteMany({});
    await prisma.pastor.deleteMany({});
    await prisma.miembro.deleteMany({});
    await prisma.iglesia.deleteMany({});

    // ----------------------------------------------------
    // 2. CREACIÓN DE DATOS BASE
    // ----------------------------------------------------

    const contrasenaHash = await hashPassword('password123');

    // B.1. CREAR PASTOR (AHORA VA PRIMERO)
    const pastor = await prisma.pastor.create({
        data: {
            nombre: 'Profesor',
            apellido: 'Adonis',
            telefono: '555-0002',
            fecha_ordenacion: new Date('2010-05-15'),
        }
    });

    // B.2. CREAR IGLESIA (USA EL ID DEL PASTOR CREADO)
    const iglesiaPrincipal = await prisma.iglesia.create({
        data: {
            nombre: 'Iglesia Central de Prueba',
            direccion: 'Calle Ficticia #123',
            pastor_id: pastor.id, // 🔑 USAR pastor.id AQUI
        }
    });

    // B.3. CREAR SECRETARIO
    const secretario = await prisma.secretario.create({
        data: {
            nombre: 'Andrea',
            apellido: 'Perez',
            telefono: '555-0001',
        }
    });

    // B.4. CREAR MIEMBRO (USA EL ID DE LA IGLESIA CREADA)
    const miembro = await prisma.miembro.create({
        data: {
            nombre: 'Daniela',
            apellido: 'Lopez',
            telefono: '555-0003',
            fecha_nacimiento: new Date('1995-11-20'),
            iglesia_id: iglesiaPrincipal.id, // USAR iglesiaPrincipal.id AQUI
        }
    });


    // ----------------------------------------------------
    // 3. ENLACE DE PERFILES Y CREACIÓN DE USUARIOS
    // ----------------------------------------------------

    // Crear Usuario para Secretario
    await prisma.usuario.create({
        data: {
            email: 'secretario@test.com',
            contrasena_hash: contrasenaHash,
            rol: Role.Secretario,
            secretario_id: secretario.id,
        }
    });

    // Crear Usuario para Pastor
    await prisma.usuario.create({
        data: {
            email: 'pastor@test.com',
            contrasena_hash: contrasenaHash,
            rol: Role.Pastor,
            pastor_id: pastor.id,
        }
    });

    // Crear Usuario para Miembro
    await prisma.usuario.create({
        data: {
            email: 'miembro@test.com',
            contrasena_hash: contrasenaHash,
            rol: Role.Miembro,
            miembro_id: miembro.id,
        }
    });

    // 4. ACTUALIZAR LA IGLESIA (Asignar el pastor_id real)
    await prisma.iglesia.update({
        where: { id: iglesiaPrincipal.id },
        data: { pastor_id: pastor.id }
    });


    console.log('Seeding completado. Creados: Secretario, Pastor, Miembro y una Iglesia.');
    console.log(`Credenciales de prueba: Email: *@test.com, Contraseña: password123`);

}

main()
    .catch((e) => {
        console.error('Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
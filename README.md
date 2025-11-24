# dbPastor
aplicacion movil

# API con Autenticación JWT – Documentación

Este proyecto implementa una API en Node.js con autenticación basada en **JSON Web Tokens (JWT)**.  
Incluye rutas públicas y rutas protegidas que requieren un token válido para acceder.

---

## 🛠 Tecnologías utilizadas
- **Node.js**
- **Express**
- **MySQL** o cualquier base de datos configurada
- **jsonwebtoken**
- **bcryptjs**
- **dotenv**
- **cors**

---

## 📂 Estructura del proyecto


---

## 🔑 Generación de Token (Login)
Para obtener un token JWT, debes hacer una petición POST a tu ruta de login:

### **POST /login**
## http://localhost:3000/api/auth/login
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "123456"
}

{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

## 🔒 Cómo acceder a rutas protegidas

Debes enviar el token en el header Authorization:

Authorization: Bearer TU_TOKEN_AQUI

{
  "ok": true,
  "message": "Acceso concedido",
  "usuario": {
    "id": 3,
    "rol": "Miembro",
    "referenciaId": 1
  }
}

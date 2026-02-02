
import express from 'express';
import cors from "cors";
import protectedRoutes from './routes/protectedRoute.js';
import authRoutes from './routes/auth.js';
import registrRoutes from './routes/registro.js'
import pastorRoutes from "./routes/pastorRoutes.js";
import iglesiaRoutes from "./routes/iglesiaRoutes.js";
import asociacionRouues from "./routes/asociacionRoutes.js"
import distritoRoutes from "./routes/distritoRoutes.js"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import estadisticasRoutes from "./routes/estadisticasRoutes.js"
import reportesRoutes from "./routes/reportesRoutes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "*", // para desarrollo: acepta desde cualquier origen
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Unión Fiel - Servicio corriendo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/data', protectedRoutes);
app.use('/api/registro', registrRoutes);
app.use("/api/pastor", pastorRoutes);
app.use("/api/iglesia", iglesiaRoutes);
app.use("/api/asociacion", asociacionRouues)
app.use("/api/distrito", distritoRoutes)
app.use("/api/usuario", usuarioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/estadisticas", estadisticasRoutes)
app.use("/api/reportes", reportesRoutes)

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
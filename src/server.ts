

import express from 'express';
import protectedRoutes from './routes/protectedRoute.js';
//import cors from 'cors'; 


import authRoutes from './routes/auth.js';
import registrRoutes from './routes/registro.js'
import pastorRoutes from "./routes/pastorRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Unión Fiel - Servicio corriendo' });
});

app.use('/api/auth', authRoutes);

app.use('/api/data', protectedRoutes);
app.use('/api/registro', registrRoutes);

app.use("/api/pastor", pastorRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
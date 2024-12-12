import express from 'express';
import cors from 'cors';
import { Octokit } from '@octokit/rest';
// Función para validar y obtener las variables de entorno
function getEnvVariable(key) {
    process.loadEnvFile();
    const value = process.env[key];
    if (!value) {
        throw new Error(`Falta la variable de entorno requerida: ${key}`);
    }
    return value;
}
// Cargar las variables de entorno requeridas
const GITHUB_TOKEN = getEnvVariable('GITHUB_TOKEN');
const REPO_OWNER = getEnvVariable('REPO_OWNER');
const REPO_NAME = getEnvVariable('REPO_NAME');
// Clase principal para inicializar el servidor
class ServerBootstrap {
    app;
    port;
    octokit;
    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 8000;
        // Inicializar Octokit con el token de autenticación
        this.octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });
        // Configurar middlewares y rutas
        this.middlewares();
        this.routes();
        this.listen();
    }
    // Configuración de middlewares
    middlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
    }
    // Definición de rutas
    routes() {
        this.app.get('/', this.getContributors.bind(this));
    }
    // Método para obtener colaboradores del repositorio
    async getContributors(_req, res) {
        try {
            const response = await this.octokit.rest.repos.listContributors({
                owner: REPO_OWNER,
                repo: REPO_NAME,
            });
            res.status(200).json(response.data); // Devolver lista de colaboradores
        }
        catch (error) {
            console.error('Error al obtener colaboradores:', error.message || error);
            res.status(500).json({
                error: 'Error al obtener colaboradores',
                details: error.message || 'Detalles no disponibles',
            });
        }
    }
    // Iniciar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor en ejecución en http://localhost:${this.port}`);
        });
    }
}
// Inicializar el servidor
new ServerBootstrap();

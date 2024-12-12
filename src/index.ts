import express, { Request, Response } from 'express';
import cors from 'cors';
import { Octokit } from '@octokit/rest';

interface EnvVariables {
  GITHUB_TOKEN: string;
  REPO_OWNER: string;
  REPO_NAME: string;
}

function getEnvVariable(key: keyof EnvVariables): string {
  process.loadEnvFile();
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
}

const GITHUB_TOKEN = getEnvVariable('GITHUB_TOKEN');
const REPO_OWNER = getEnvVariable('REPO_OWNER');
const REPO_NAME = getEnvVariable('REPO_NAME');

class ServerBootstrap {
  public app: express.Application;
  private port: number;
  private octokit: Octokit;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8000;

    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });

    this.middlewares();
    this.routes();
    this.listen();
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  private routes() {
    this.app.get('/', this.getContributors.bind(this));
  }

  private async getContributors(_req: Request, res: Response) {
    try {
      const response = await this.octokit.rest.repos.listContributors({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });

      res.status(200).json(response.data);
    } catch (error: any) {
      console.error('Error al obtener colaboradores:', error.message || error);
      res.status(500).json({
        error: 'Error al obtener colaboradores',
        details: error.message || 'Detalles no disponibles',
      });
    }
  }

  private listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en ejecución en http://localhost:${this.port}`);
    });
  }
}

new ServerBootstrap();

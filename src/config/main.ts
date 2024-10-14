import 'dotenv/config';

// Obtener el puerto desde las variables de entorno
const port = process.env.PORT;
const natsServers = process.env.NATS_SERVERS
  ? process.env.NATS_SERVERS.split(',')
  : undefined;

if (!natsServers || natsServers.length === 0)
  throw new Error('Config validation error: NATS_SERVERS is missing or empty');

if (!port) {
  throw new Error(
    'Environment variable "PORT" is not set. Please define it in the .env file.',
  );
}

export const serverConfig = {
  PORT: Number(port),
  NATS_SERVERS: natsServers,
};

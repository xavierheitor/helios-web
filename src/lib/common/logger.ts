import winston from "winston";

const { combine, timestamp, json, printf } = winston.format;

// Formato personalizado para logs de console
const consoleFormat = printf(({ level, message, timestamp, metadata }) => {
  return `${timestamp} [${level}]: ${message} ${
    metadata ? JSON.stringify(metadata) : ""
  }`;
});

// Criação de loggers específicos para cada tipo de log
const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
    }),
    new winston.transports.Console({
      format: combine(winston.format.colorize(), consoleFormat),
      level: "debug",
    }),
  ],
});

// Logger específico para logs do Prisma
const prismaLogger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    new winston.transports.File({
      filename: "logs/prisma.log",
      level: "info",
    }),
  ],
});

export { logger, prismaLogger };

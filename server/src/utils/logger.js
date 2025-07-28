import winston from 'winston';

export const auditLog = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log', level: 'info' })
  ],
  format: winston.format.json()
});

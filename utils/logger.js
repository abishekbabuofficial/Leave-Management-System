const { createLogger, format, transports } = require('winston');
const path = require('path');


const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join('logs', 'combined.log') }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join('logs', 'exceptions.log') }),
  ],
});

module.exports = logger;

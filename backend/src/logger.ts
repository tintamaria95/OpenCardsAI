import winston from 'winston'
import * as dotenv from 'dotenv'

dotenv.config()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'warn.log', level: 'warn' })
  ]
})

if (process.env.NODE_ENV !== 'PROD') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'info'
    })
  )
}

export default logger

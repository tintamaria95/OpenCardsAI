import * as fs from 'fs'
import logger from './logger';

function isFileEmpty(filePath: fs.PathLike) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size === 0;
  } catch (error) {
    if (error)
    logger.warn(`SQLite: File does not exist at path "${filePath}" and will be created...`)
    return true
  }
}


export { isFileEmpty }
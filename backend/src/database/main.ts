import { Sequelize } from 'sequelize-typescript'
import logger from '../logger'
import { isFileEmpty } from '../utils'
import { LobbyModel } from './models/Lobby.model'

const globalDatabasefilePath = 'sqlite-files/data.db'

async function getDatabase() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: globalDatabasefilePath,
    logging: false,
    define: {
      freezeTableName: true
    },
    models: [LobbyModel]
  })

  if (isFileEmpty(globalDatabasefilePath)) {
    logger.info(
      'SQLite: Database file does not exist or empty. Setting Database...'
    )
    try {
      await sequelize.sync()
    } catch (error) {
      logger.error(
        'SQLite: Error while trying to synchronize the database.',
        error
      )
    }

    logger.info('SQLite: Tables set...')
  }
  try {
    await sequelize.authenticate()
    logger.info(
      'SQLite: Connection to database has been established successfully.'
    )
  } catch (error) {
    logger.error('SQLite: Unable to connect to the database:', error)
  }
  return sequelize
}

export default getDatabase

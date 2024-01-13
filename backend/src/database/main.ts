import { Sequelize } from 'sequelize-typescript'
import logger from '../logger';
import { isFileEmpty } from '../utils';
import { LobbyModel, createLobbyInstance } from './models/Lobby.model';

const DATABASE_FILE_PATH = "sqlite-files/data.db"

async function getDatabase() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: DATABASE_FILE_PATH,
        logging: false,
        define: {
            freezeTableName: true
        },
        models: [LobbyModel]
    })

    if (isFileEmpty(DATABASE_FILE_PATH)) {
        logger.info("SQLite: Database file does not exist or empty. Setting Database...")
        await sequelize.sync()
        logger.info("SQLite: Tables set...")
    }
    try {
        await sequelize.authenticate();
        logger.info('SQLite: Connection to database has been established successfully.');
    } catch (error) {
        logger.error('SQLite: Unable to connect to the database:', error);
    }
    return sequelize
}

async function main() {
    const sequelize = await getDatabase()
    await sequelize.sync()
    const lobby = await createLobbyInstance(
        {lobbyName: "test", isPublic: true, numberOfPlayersInLobby: 2, status: "test"})
    const lobbies = await LobbyModel.findOne()
    console.log(lobbies)
}

main()
export default getDatabase


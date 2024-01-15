import { Table, Column, Model } from 'sequelize-typescript'

type LobbyColumns = {
    lobbyName: string
    isPublic: boolean
    numberOfPlayersInLobby: number
    status: string
}

@Table({ timestamps: true })
class LobbyModel extends Model implements LobbyColumns {
    @Column({ allowNull: false })
    declare lobbyName: string

    @Column({ allowNull: false })
    declare isPublic: boolean

    @Column
    declare numberOfPlayersInLobby: number

    @Column({ allowNull: false })
    declare status: string
}

async function createLobbyInstance(columns: LobbyColumns) {
    const lobby = await LobbyModel.create(columns)
    return lobby
}

async function getPublicLobbies() {
    // await createLobbyInstance({ lobbyName: "test", isPublic: true, numberOfPlayersInLobby: 2, status: "OK" })
    const lobbies = await LobbyModel.findAll({
        where: { isPublic: true }
        // attributes: Object.keys(LobbyModel.getAttributes)
    })
    return lobbies
}

export { LobbyModel, createLobbyInstance, getPublicLobbies }

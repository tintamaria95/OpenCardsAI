import { Table, Column, Model } from 'sequelize-typescript';

type LobbyColumns = {
    lobbyName: string
    isPublic: boolean
    numberOfPlayersInLobby: number
    status: string
}

@Table({ timestamps: true })
class LobbyModel extends Model implements LobbyColumns {
    @Column({ allowNull: false })
    declare lobbyName: string;

    @Column
    declare isPublic: boolean;

    @Column
    declare numberOfPlayersInLobby: number;

    @Column
    declare status: string;
}

async function createLobbyInstance(columns: LobbyColumns) {
    const lobby = await LobbyModel.create(columns)
    return lobby
}

export { LobbyModel, createLobbyInstance }
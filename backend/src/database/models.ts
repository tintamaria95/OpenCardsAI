import { Sequelize, DataTypes } from "sequelize";

const lobbyConfig = {
  lobbyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  numberOfPlayersInLobby: {
      type: DataTypes.NUMBER,
      allowNull: false
  },
  status: {
      type: DataTypes.STRING,
      allowNull: false
  },
}


const createLobbyTable = (sequelize: Sequelize) => {
    sequelize.define('Lobby', lobbyConfig, {});
}

export { createLobbyTable }
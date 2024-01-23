import { Request, Response } from "express";
import { LobbyInfosType } from "../type/LobbyInfo";
import { Server, Socket } from 'socket.io'
import { info } from "console";

export function handleLeaveLobby(socket: Socket, lobbiesList: LobbyInfosType[], infos: {lobbyId: string, playerId: string}){
    // Remove player from lobby
    const lobbyToUpdate = lobbiesList.find(lobby => lobby.id == infos.lobbyId)
    if (lobbyToUpdate !== undefined && lobbyToUpdate.players !== undefined) {
        const players = lobbyToUpdate.players.filter(player => player.id != infos.playerId)
        lobbyToUpdate.players = players
    // If no players left in lobby1 and playerHost has created another lobby2, remove lobby1
        // if (lobbyToUpdate.players.length == 0) {
        //     lobbiesList = lobbiesList.filter(lobby => lobby.id !== lobbyToUpdate.id)
        // }
    }
    socket.broadcast.to(infos.lobbyId).emit('update-lobby', lobbyToUpdate)
}

export function handleJoinLobby(socket: Socket, lobbiesList: LobbyInfosType[], infos: {lobbyId: string, playerInfo: {id: string, name: string}}){
    const lobbyToUpdate = lobbiesList.find(lobby => lobby.id == infos.lobbyId)
    if (lobbyToUpdate !== undefined && lobbyToUpdate.players !== undefined) {
        if (lobbyToUpdate.players.find(player => player.id == infos.playerInfo.id) == undefined){
            lobbyToUpdate.players.push({id: infos.playerInfo.id, name: infos.playerInfo.name})
        }
    }
    socket.broadcast.to(infos.lobbyId).emit('update-lobby', lobbyToUpdate)
}
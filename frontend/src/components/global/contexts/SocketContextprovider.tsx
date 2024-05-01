import { SocketContext } from "./SocketContext";
import { ReactElement } from "react";
import socket from "../../../socket";

export function SocketContextProvider({ children }: { children: ReactElement }) {
    
    return (
        <SocketContext.Provider value={{ socket: socket}}>
            {children}
        </SocketContext.Provider>
    )
}
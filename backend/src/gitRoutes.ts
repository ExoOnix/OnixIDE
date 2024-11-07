// socketHandlers.ts
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { Socket } from 'socket.io';

const git: SimpleGit = simpleGit('./project');


export async function generalChange(io: any) {
    try {
        const status = await git.status();
        io.emit("gitUpdate", status)
    } catch (err) {
        console.error(err)
    }
}

// Example of the 'updateTree' handler
export function GitRoutes(socket: Socket, io: any) {
    
}
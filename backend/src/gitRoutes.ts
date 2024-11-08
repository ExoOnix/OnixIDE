// socketHandlers.ts
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { Socket } from 'socket.io';
import { existsSync } from 'fs';
const git: SimpleGit = simpleGit('./project');

export async function generalChange(io: any) {
    try {
        let GitRunning = false
        if (existsSync("./project/.git")) {
            GitRunning = true
        }
        const status = await git.status();
        io.emit("gitUpdate", status, GitRunning)
    } catch (err) {
        console.error(err)
    }
}

// Example of the 'updateTree' handler
export function GitRoutes(socket: Socket, io: any) {
    socket.on('recieveGit', () => {
        generalChange(io)
    })
    socket.on("addFile", async (filePath) => {
        await git.add(filePath)
        generalChange(io)
    })
    socket.on("resetFile", async (filePath) => {
        await git.reset([filePath])
        generalChange(io)
    })
    socket.on("gitCommit", async (message) => {
        await git.commit(message);
    })
}
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
        const branchSummary = await git.branch();
        const branches = branchSummary.all;
        const currentBranch = branchSummary.current
        io.emit("gitUpdate", status, GitRunning, branches, currentBranch)
    } catch (err) {
        io.emit("gitRunning", false)
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
        generalChange(io)
    })
    socket.on("gitPush", async () => {
        try {
            await git.push();
            generalChange(io);
        } catch (err) {
            console.log("Git Push Error:", err);
        }
    });
    socket.on("gitPull", async () => {
        try {
            await git.pull();
            generalChange(io);
        } catch (err) {
            console.log("Git Push Error:", err);
        }
    });
    socket.on("switchBranch", async (branchName) => {
        try {
            await git.checkout(branchName);
            generalChange(io);
        } catch(err) {
            console.log("Error switching branch: ", err)
        }
    })
}
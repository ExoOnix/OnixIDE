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
        const branches = branchSummary.all.filter(branch => !branch.startsWith('remotes/'));
        const currentBranch = branchSummary.current

        const commitsCount = await git.revparse(['--is-inside-work-tree']).then(() => {
            return git.revparse(['HEAD']);
        }).then(() => {
            // If we can resolve HEAD, it means there are commits
            return true;
        }).catch(() => {
            // If there's an error resolving HEAD, there are no commits yet
            return false;
        });

        if (!commitsCount) {
            // Handle the case where there are no commits yet
            io.emit("gitUpdate", status, GitRunning, branches, currentBranch, []);
            return;
        }

        // Only proceed to log if there are commits
        const log = await git.log({ '--max-count': 10 });

        const commits = log.all.map(commit => ({
            hash: commit.hash,
            message: commit.message,
            active: commit.hash === log.latest?.hash
        }));
        io.emit("gitUpdate", status, GitRunning, branches, currentBranch, commits)
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
    socket.on("createBranch", async (branchName) => {
        try {
            await await git.checkout(['-b', branchName]);
            generalChange(io);
        } catch (err) {
            console.log("Error switching branch: ", err)
        }
    })
    socket.on("deleteBranch", async (branchName) => {
        try {
            await git.branch(['-D', branchName]);
            generalChange(io); // Update as needed for your app's state
            console.log(`Branch '${branchName}' deleted successfully.`);
        } catch (err) {
            console.log("Error deleting branch: ", err);
        }
    });

    socket.on("gitCheckout", async (commitHash) => {
        try {
            await git.checkout(commitHash);
            generalChange(io);
        } catch (err) {
            console.log("Git Checkout Error:", err);
        }
    });

}
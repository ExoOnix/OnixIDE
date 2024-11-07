import express from 'express';
import { Server, Socket } from 'socket.io';
import { spawn } from 'child_process';
import * as http from 'http';
import { ChangeSet, Text } from "@codemirror/state";
import { Update } from "@codemirror/collab";
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import AdmZip from 'adm-zip';
import cors from 'cors';
import * as pty from 'node-pty'
import os from 'os'
import chokidar from 'chokidar';
import ollama from 'ollama';
import dotenv from 'dotenv';
import { GitRoutes, generalChange } from './gitRoutes.js';

const envPath = path.resolve('../.env');
dotenv.config({ path: envPath })
console.log("Configuration:")
console.log("USE_OLLAMA:", process.env.USE_OLLAMA || false);
interface FileItem {
	id: number;
	parent: number;
	droppable?: boolean;
	text: string;
}

// Initialize Express and create HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket setup
let io = new Server(server, {
	path: "/ws",
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

// Serve static files from the 'public' directory (if needed)
app.use(express.static('public'));
app.use(cors()); // Add this line to enable CORS

// Define some API routes
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from Express!' });
});

// Middleware to handle JSON requests
app.use(express.json());

function resetTree() {
	const folderPath = path.resolve('./project');
	const updatedTree = JSON.stringify(generateFileList(folderPath), null, 4);

	// Broadcast updated file tree to all clients, using the same event
	io.emit('getFilesResponse', updatedTree);
}

var detectChanges = true;

function watchChanges(filePath: string) {
	if (detectChanges) {
		console.log(`File changed: ${filePath}`);
		// Get the relative file path within the project
		const relativeFilePath = path.relative('./project', filePath);

		// Check if the document exists in the document map
		if (documents.has(relativeFilePath)) {
			// Read the updated content from the file
			const fileContent = fs.readFileSync(filePath, 'utf-8');

			// Get the document and reset its content and changes
			const document = documents.get(relativeFilePath)!;
			const newDoc = Text.of(fileContent.split('\n'));
			document.doc = newDoc;
			document.updates = []; // Reset the ChangeSet (updates) to empty
			// Update the document map with the new content
			documents.set(relativeFilePath, { ...document, doc: newDoc });
			console.log(relativeFilePath)
			io.emit("resetFile", relativeFilePath)
		}
	} else {
		detectChanges = true;
	}
}



function deleteExternal(filePath: string, isDir: boolean) {
	resetTree()
	const relativeFilePath = path.relative('./project', filePath);

	console.log(relativeFilePath)

	if (isDir == true) {
		documents.forEach((_, docPath) => {
			// Check if the document path starts with the directory path
			if (docPath.startsWith(relativeFilePath)) {
				documents.delete(docPath);
			}
		});
	}
	else {
		documents.delete(relativeFilePath);
	}
}

const watcher = chokidar.watch('./project', {
	ignored: [
		/(^|[\/\\])\../,  // Ignore dotfiles (e.g., .git, .DS_Store)
		/[\/\\]node_modules[\/\\]/,  // Ignore node_modules directory at any level
		/[\/\\]\.git[\/\\]/,          // Ignore .git directory at any level
		/[\/\\]tmp[\/\\]/,            // Ignore tmp directory at any level
		/[\/\\]build[\/\\]/,          // Ignore build directory at any level
		/[\/\\]dist[\/\\]/            // Ignore dist directory at any level
	],
	persistent: true,
});



watcher
	.on('add', (path) => {
		resetTree()
		generalChange(io)
	})
	.on('unlink', (path) => {
		deleteExternal(path, false)
		generalChange(io)
	})
	.on('addDir', (path) => {
		resetTree()
		generalChange(io)
	})
	.on('unlinkDir', (path) => {
		deleteExternal(path, true)
		generalChange(io)
	}
	)
	.on('error', (error) => console.error(`Watcher error: ${error}`))
	.on('change', (path) => {
		watchChanges(path)
		generalChange(io)
	});



// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Correctly configured

app.post('/api/upload/:path*?', upload.single('file'), (req: any, res: any) => {
	// Log the entire request object for debugging
	console.log('Uploaded file object:', req.file); // Log the uploaded file object

	const uploadPath = req.params.path || ''; // Get path parameter; defaults to empty string
	const zipBuffer = req.file?.buffer; // Get uploaded file buffer

	// Check if zipBuffer and req.file are defined
	if (!req.file) {
		console.error('No file found in req.file'); // Log if no file was found
		return res.status(400).json({ message: 'No file uploaded' });
	}
	if (!zipBuffer) {
		console.error('File buffer is undefined'); // Log if buffer is not available
		return res.status(400).json({ message: 'File buffer is undefined' });
	}

	// Ensure targetPath handles the root directory case
	const targetPath = path.join('./project', uploadPath);
	const targetZipFilePath = path.join(targetPath, req.file.originalname); // Define target ZIP file path

	try {
		// Create target directory if it doesn't exist
		if (!fs.existsSync(targetPath)) {
			fs.mkdirSync(targetPath, { recursive: true });
		}

		// Write the buffer to the target ZIP file
		fs.writeFileSync(targetZipFilePath, zipBuffer);

		// Unzip the uploaded file
		const zip = new AdmZip(targetZipFilePath);
		zip.extractAllTo(targetPath, true);

		// Optionally, delete the zip file after extraction
		fs.unlinkSync(targetZipFilePath); // Uncomment if you want to delete after extraction

		// Convert line endings in all files
		convertLineEndingsToLF(targetPath);

		return res.status(200).json({ message: 'File uploaded and extracted successfully!' });
	} catch (error) {
		console.error('Error extracting file:', error);
		return res.status(500).json({ message: 'Error extracting file', error });
	}
});

if (process.env.USE_OLLAMA == "true") {
app.post('/api/autocomplete', async (req: any, res: any) => {
	const { prefix, suffix, ext } = req.body;

	// Construct the prompt for the Ollama API
	const prompt = `${prefix}<FILL_ME>${suffix}`;
	try {
		// Call Ollama API using the library
		const response = await ollama.generate({
			model: 'codellama:7b-code', // Replace with your actual model name
			prompt: `<PRE> ${prefix} <SUF>${suffix} <MID>`
		});

		// Extract and trim the content from the response
		const messageContent = response.response?.trim() || "";

		// Check if the content is "NONE" or empty, then respond accordingly
		if (messageContent.toUpperCase() === "NONE") {
			return res.json({ prediction: "" });
		}

		// Log and respond with the prediction
		console.log(messageContent);
		res.json({ prediction: messageContent });

	} catch (error) {
		console.error("Error calling Ollama API:", error);
		res.status(500).json({ error: "Internal server error" });
	}
})}


/**
 * Recursively traverse the directory and convert line endings to LF for text files.
 */
const convertLineEndingsToLF = (directory: string) => {
	const files = fs.readdirSync(directory);

	files.forEach((file) => {
		const fullPath = path.join(directory, file);

		// Check if it is a directory or a file
		if (fs.lstatSync(fullPath).isDirectory()) {
			// Recursively convert files in subdirectories
			convertLineEndingsToLF(fullPath);
		} else {
			// Only process text files (based on content, not just extension)
			if (isTextFile(fullPath)) {
				// Read the file, convert line endings, and rewrite it
				const content = fs.readFileSync(fullPath, 'utf-8');
				const convertedContent = content.replace(/\r\n/g, '\n');
				fs.writeFileSync(fullPath, convertedContent, 'utf-8');
			}
		}
	});
};

/**
 * Check if a file is likely a text file by checking both the extension and content.
 */
const isTextFile = (filePath: string): boolean => {
	const textFileExtensions = [
		'.txt', '.js', '.ts', '.json', '.html', '.css', '.md', '.py',
		'.xml', '.csv', '.env', '.yml', '.yaml', '.sh', '.rb', '.go', '.java'
	];

	// First, check if the file extension is likely a text file
	if (textFileExtensions.some(ext => filePath.endsWith(ext))) {
		return true;
	}

	// If the extension check fails, inspect the content to see if it's a text file
	const buffer = fs.readFileSync(filePath);
	return isBufferText(buffer);
};
const isBufferText = (buffer: Buffer): boolean => {
	// Read a portion of the file (first 8000 bytes max) for analysis
	const sampleSize = Math.min(buffer.length, 8000);
	const sample = buffer.slice(0, sampleSize);

	// Loop through the sample bytes
	for (let i = 0; i < sample.length; i++) {
		const charCode = sample[i];

		// Printable characters fall within these ranges
		if (
			(charCode > 127 && charCode < 160) || // Extended ASCII control characters
			charCode === 0  // Null bytes typically indicate binary data
		) {
			return false;  // Not a text file if we find non-printable characters
		}
	}

	return true;  // The file seems to contain only printable text characters
};
function traverseDirectory(
	dirPath: string,
	parentId: number,
	result: FileItem[],
	idCounter: { current: number },
	isRoot: boolean = false
) {
	if (!isRoot) {
		const folderId = idCounter.current++;
		const folderName = path.basename(dirPath);

		result.push({
			id: folderId,
			parent: parentId,
			droppable: true,
			text: folderName
		});

		parentId = folderId;
	}

	const filesAndFolders = fs.readdirSync(dirPath);

	filesAndFolders.forEach(name => {
		const fullPath = path.join(dirPath, name);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			traverseDirectory(fullPath, parentId, result, idCounter);
		} else {
			result.push({
				id: idCounter.current++,
				parent: parentId,
				text: name
			});
		}
	});
}

function generateFileList(rootFolderPath: string): FileItem[] {
	const result: FileItem[] = [];
	const idCounter = { current: 1 };

	traverseDirectory(rootFolderPath, 0, result, idCounter, true);

	return result;
}

// WebSocket functionality (unchanged)
interface Document {
	updates: Update[],
	doc: Text,
	pending: ((value: any) => void)[],
	lastAccessed: number
}

let documents = new Map<string, Document>();
documents.set('', {
	updates: [],
	pending: [],
	doc: Text.of(['\n\n\nStarting doc!\n\n\n']),
	lastAccessed: Date.now()
});

function clearDocuments() {
	const now = Date.now();
	documents.forEach((doc, name) => {
		if (now - doc.lastAccessed > 1000 * 60 * 5) {
			documents.delete(name);
			io.emit("resetFile", name)
		}
	});
}

setInterval(clearDocuments, 1000 * 60 * 1);


function getDocument(name: string): Document {
	const fullPath = path.join('./project', name);

	if (documents.has(name)) return documents.get(name)!;


	let fileContent = '';
	try {
		if (fs.existsSync(fullPath)) {
			fileContent = fs.readFileSync(fullPath, 'utf-8');
		} else {
			fs.writeFileSync(fullPath, `\n\n\nHello World from ${name}\n\n\n`);
			fileContent = `\n\n\nHello World from ${name}\n\n\n`;
		}
	} catch (error) {
		console.error(`Error reading file: ${fullPath}`, error);
	}

	const documentContent: Document = {
		updates: [],
		pending: [],
		doc: Text.of(fileContent.split('\n')),
		lastAccessed: Date.now()
	};

	documents.set(name, documentContent);

	return documentContent;
}
function moveFolderRecursively(oldFolderPath: string, newFolderPath: string) {
	// Traverse the old folder and its contents
	const filesAndFolders = fs.readdirSync(oldFolderPath);

	filesAndFolders.forEach(name => {
		const oldFullPath = path.join(oldFolderPath, name);
		const newFullPath = path.join(newFolderPath, name);
		const stat = fs.statSync(oldFullPath);

		if (stat.isDirectory()) {
			// Recursively move the subfolder
			fs.mkdirSync(newFullPath, { recursive: true });
			moveFolderRecursively(oldFullPath, newFullPath);
		} else {
			// Move the file
			fs.renameSync(oldFullPath, newFullPath);

			// Update the document map if the file is open
			const oldRelativePath = path.relative('./project', oldFullPath);
			const newRelativePath = path.relative('./project', newFullPath);

			if (documents.has(oldRelativePath)) {
				const document = documents.get(oldRelativePath)!;
				documents.set(newRelativePath, document);
				documents.delete(oldRelativePath);
			}
		}
	});

	// After moving all contents, remove the old folder
	fs.rmdirSync(oldFolderPath);
}
function removeFolderFromDocuments(dirPath: string) {
	const filesAndFolders = fs.readdirSync(dirPath);

	filesAndFolders.forEach((name) => {
		const fullPath = path.join(dirPath, name);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// Recursively handle subdirectories
			removeFolderFromDocuments(fullPath);
		} else {
			// Remove file from documents map
			const relativePath = path.relative('./project', fullPath);
			documents.delete(relativePath);
		}
	});
}



// WebSocket connection handling (same as before)
let treeData: any[] = [];
io.on('connection', (socket: Socket) => {
	// Handle incoming updates to the tree data
	socket.on('updateTree', (data: string) => {
		try {
			const parsedTreeData = JSON.parse(data);
			console.log('Received tree data:', parsedTreeData);

			// Update in-memory treeData
			treeData = parsedTreeData;

			treeData.forEach(([oldPath, newPath]) => {
				const oldFullPath = `./project/${oldPath}`;
				const newFullPath = `./project/${newPath}`;

				// Emit the editor path update
				io.emit("updateEditorPath", oldPath, newPath);

				// Move folder or file and update the file system
				const stat = fs.statSync(oldFullPath);
				if (stat.isDirectory()) {
					// Create the new folder path if it doesn't exist
					fs.mkdirSync(newFullPath, { recursive: true });

					// Move the folder and its contents
					moveFolderRecursively(oldFullPath, newFullPath);
				} else {
					// Move the file
					fs.renameSync(oldFullPath, newFullPath);

					// Update the documents map for the moved file
					if (documents.has(oldPath)) {
						const document = documents.get(oldPath);
						documents.set(newPath, document!);
						documents.delete(oldPath);
					}
				}

			});
		} catch (error) {
			console.error('Failed to update file system', error);
		}
	});

	socket.on('pullUpdates', (documentName, version: number) => {
		try {
			const { updates, pending, doc } = getDocument(documentName);

			if (version < updates.length) {
				socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)));
			} else {
				pending.push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(updates.slice(version))); });
				documents.set(documentName, { updates, pending, doc, lastAccessed: Date.now() });
			}
		} catch (error) {
			console.error('pullUpdates', error);
		}
	});
	socket.on('pushUpdates', (documentName, version, docUpdates) => {
		try {
			detectChanges = false;


			let { updates, pending, doc } = getDocument(documentName);
			docUpdates = JSON.parse(docUpdates);

			if (version != updates.length) {
				socket.emit('pushUpdateResponse', false);
			} else {
				for (let update of docUpdates) {
					let changes = ChangeSet.fromJSON(update.changes);
					updates.push({ changes, clientID: update.clientID, effects: update.effects });
					doc = changes.apply(doc);
				}

				documents.set(documentName, { updates, pending, doc, lastAccessed: Date.now() });
				// Write the updated document to the actual file
				const fullPath = path.join('./project', documentName);
				fs.writeFileSync(fullPath, doc.toString());

				socket.emit('pushUpdateResponse', true);
				while (pending.length) pending.pop()!(updates);
			}
		} catch (error) {
			console.error('pushUpdates', error);
		}
	});


	socket.on('getDocument', (documentName) => {
		try {
			let { updates, doc } = getDocument(documentName);
			socket.emit('getDocumentResponse', updates.length, doc.toString());
		} catch (error) {
			console.error('getDocument', error);
		}
	});

	socket.on('edit', (params) => {
		socket.emit('display', params);
	});
	socket.on('getFiles', () => {
		try {
			const folderPath = path.resolve('./project');
			socket.emit('getFilesResponse', JSON.stringify(generateFileList(folderPath), null, 4));
		} catch (error) {
			console.error('getFiles', error);
		}
	});
	socket.on('delete', (mainpath) => {
		const fullPath = path.join('./project', mainpath);

		// Check if the path is a directory
		const stat = fs.lstatSync(fullPath);
		// If it's a folder, recursively remove all files from documents map
		if (stat.isDirectory()) {
			removeFolderFromDocuments(`./project/${mainpath}`);
		} else {
			// If it's a file, directly remove it from documents map
			const relativePath = path.relative('./project', fullPath);
			documents.delete(relativePath);
		}
		// console.log(documents)
		// Remove folder or file from the file system
		fs.rm(fullPath, { recursive: true, force: true }, (err) => {
			if (err) {
				throw err;
			}

			// Broadcast updated file tree to all clients
			const updatedTree = JSON.stringify(generateFileList('./project'), null, 4);
			io.emit('getFilesResponse', updatedTree);
		});
	});
	socket.on('createFile', (mainpath) => {
		// Define the full path for the new empty file
		const filePath = `./project/${mainpath}`;

		// Create an empty file
		fs.writeFile(filePath, '', (err) => {
			if (err) {
				throw err;
			}

			// Generate the updated file tree
			const updatedTree = JSON.stringify(generateFileList("./project"), null, 4);

			// Broadcast updated file tree to all clients
			io.emit('getFilesResponse', updatedTree);
		});
	});
	socket.on('createFolder', (mainpath) => {
		// Define the full path for the new folder
		const folderPath = `./project/${mainpath}`;

		// Create the new folder
		fs.mkdir(folderPath, { recursive: true }, (err) => {
			if (err) {
				throw err;
			}

			// Generate the updated file tree
			const updatedTree = JSON.stringify(generateFileList("./project"), null, 4);

			// Broadcast updated file tree to all clients
			io.emit('getFilesResponse', updatedTree);
		});
	});

	// Define the shell based on the operating system
	const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

	const ptyProcess = pty.spawn(shell, [], {
		name: "xterm-color",
		cols: 183,
		rows: 16,
		cwd: "./project",
		env: process.env,
	});

	// Handle incoming data from the terminal
	(ptyProcess as any).on("data", (data: string) => {
		socket.emit("terminal.incomingData", data); // Send to the specific socket
	});

	// Handle keystrokes sent from the client
	socket.on("terminal.keystroke", (data: string) => {
		ptyProcess.write(data);
	});
	socket.on('terminal.resize', (columns, rows) => {
		// Resize the pty process based on the new dimensions
		ptyProcess.resize(columns, rows);
	});

	GitRoutes(socket, io)

	// Clean up the pty process on disconnect
	socket.on('disconnect', () => {
		ptyProcess.kill(); // Properly close the PTY process
	});

});

// Start the server on the same port for both Express and WebSocket
const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server listening on port: ${port}`));

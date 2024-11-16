import { Socket } from 'socket.io';

// Simulate message storage (in-memory)
let messages: { user: string, message: string }[] = [];

export function ChatRoutes(socket: Socket, io: any) {
    console.log('Client connected:', socket.id);

    // Send existing message history (latest 50 messages) when a new client connects
    socket.emit('receiveHistory', messages.slice(-50));

    // Handle incoming messages
    socket.on('sendMessage', (data) => {
        console.log("Received message:", data); // Log the message

        // Store the new message, but only keep the last 50 messages
        messages.push(data);
        if (messages.length > 50) {
            messages.shift(); // Remove the oldest message if there are more than 50
        }

        // Broadcast the new message to all clients
        io.emit('receiveMessage', data); // Emit to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
}

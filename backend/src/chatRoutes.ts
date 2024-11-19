import { Socket } from 'socket.io';

let messages: { user: string, message: string }[] = [];

export function ChatRoutes(socket: Socket, io: any) {
    socket.emit('receiveHistory', messages.slice(-50));

    socket.on('sendMessage', (data) => {
        console.log("Received message:", data);

        messages.push(data);
        if (messages.length > 50) {
            messages.shift();
        }

        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
}

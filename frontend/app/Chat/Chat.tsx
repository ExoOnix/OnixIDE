import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../stores/usernameStore"; // Your store for username
import { useSocket } from "../Editor/Editor"; // Your custom hook for socket

export const Chat = () => {
    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);
    const clearUsername = useUserStore((state) => state.clearUsername);
    const socket: any = useSocket(); // Use the socket instance

    const [messages, setMessages]: any = useState([]); // State for storing messages
    const [input, setInput] = useState(""); // State for message input
    const [usernameInput, setUsernameInput] = useState(""); // State for username input

    // Ref to scroll to the bottom of the messages
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Effect to listen for incoming messages
    useEffect(() => {
        if (socket) {
            // Listen for new messages
            socket.on('receiveMessage', (message: any) => {
                console.log("Received message: ", message);
                setMessages((prevMessages: any) => [...prevMessages, message]); // Append message to chat
            });

            // Listen for the chat history on connection
            socket.on('receiveHistory', (chatHistory: any) => {
                console.log("Received chat history: ", chatHistory);
                setMessages(chatHistory); // Set the initial chat history
            });

            // Cleanup on unmount
            return () => {
                socket.off('receiveMessage');
                socket.off('receiveHistory');
            };
        }
    }, [socket]);

    // Scroll to the bottom when new messages are added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // This effect runs when the messages array changes

    // Send message to the server
    const handleSendMessage = () => {
        if (input.trim() && username) {
            const messageData = { user: username, message: input };
            console.log("Sending message: ", messageData);

            socket.emit('sendMessage', messageData); // Emit the message to the server
            setInput(""); // Clear the input after sending
        }
    };

    // Set username when the button is clicked
    const handleSetUsername = () => {
        if (usernameInput.trim()) {
            setUsername(usernameInput); // Set username in the store
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#2e2e2e] text-white">
            {!username ? (
                <div className="flex flex-col justify-center items-center flex-1">
                    <div className="mb-4 text-center">
                        <p className="text-lg font-semibold">Set Your Username</p>
                        <p className="text-gray-400">Enter a username to start chatting</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Enter your username"
                            value={usernameInput} // Bind to the separate usernameInput state
                            onChange={(e) => setUsernameInput(e.target.value)} // Update the usernameInput state
                            className="bg-[#2e2e2e] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <Button
                            onClick={handleSetUsername} // Set the username when clicked
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        >
                            Set
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center py-2">
                        <Button
                            onClick={clearUsername}
                            className="text-red-500 hover:underline"
                        >
                            Change Username
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col">
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-center mt-4">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg: any, index: any) => (
                                <div key={index} className="mb-2">
                                    <span className="block text-sm font-semibold">
                                        {msg.user} {/* Display "You" only if the message is from the current user */}
                                    </span>
                                    <span className="block text-gray-300 break-words">{msg.message}</span> {/* Prevent overflow, ensure text wraps */}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} /> {/* This is the scroll anchor */}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#2e2e2e]">
                        <Input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-[#2e2e2e] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        >
                            Send
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chat;

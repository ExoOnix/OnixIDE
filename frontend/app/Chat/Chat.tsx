import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../stores/usernameStore"; // Import the store

export const Chat = () => {
    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);
    const clearUsername = useUserStore((state) => state.clearUsername);

    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState("");
    const [usernameInput, setUsernameInput] = React.useState(""); // Separate state for username input

    const handleSendMessage = () => {
        if (input.trim() && username) {
            setMessages([...messages, { user: username, message: input }]);
            setInput("");
        }
    };

    const handleSetUsername = () => {
        if (usernameInput.trim()) {
            setUsername(usernameInput); // Set the username when the button is clicked
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
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-center mt-4">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="mb-2">
                                    <span className="block text-sm font-semibold">
                                        {msg.user === username ? "You" : msg.user} {/* Display "You" for user's messages */}
                                    </span>
                                    <span className="block text-gray-300">{msg.message}</span>
                                </div>
                            ))
                        )}
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

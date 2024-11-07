import React from "react";
import { useSocket } from "../Editor/Editor";
import { useEffect } from "react";

export const Git = () => {
    const socket: any = useSocket();
    useEffect(() => {
        console.log("recieved")
        socket.on("gitUpdate", (status: any) => {
            console.log(status)
        })
    }, [socket])
    

    return (
        <div style={{ color: 'white' }}>
            <div style={{
                height: '20px',
                width: '100%',
                backgroundColor: '#424242',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                color: "white"
            }}>
                <span>OnixIDE</span>
            </div>
            
        </div>
    );
};

export default Git;

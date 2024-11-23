import React, { useState, useRef } from "react";
import SimplePeer, { Instance as SimplePeerInstance } from "simple-peer";

export const Audio: React.FC = () => {
    const [isCallActive, setIsCallActive] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const peerRef = useRef<SimplePeerInstance | null>(null);

    // Start Audio Call
    const startCall = async (): Promise<void> => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);

            // Attach stream to audio element
            if (audioRef.current) {
                audioRef.current.srcObject = mediaStream;
                await audioRef.current.play();
            }

            // Initialize SimplePeer (replace with actual signaling logic for real apps)
            const peer = new SimplePeer({ initiator: true, trickle: false, stream: mediaStream });
            peerRef.current = peer;

            peer.on("signal", (data: any) => {
                console.log("Signal Data:", data);
                // Send signal data to the remote peer via a signaling server
            });

            peer.on("stream", (remoteStream: MediaStream) => {
                // Handle the remote stream
                console.log("Remote Stream:", remoteStream);
            });

            setIsCallActive(true);
        } catch (error) {
            console.error("Error starting audio call:", error);
        }
    };

    // End Audio Call
    const endCall = (): void => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsCallActive(false);
    };

    // Toggle Mute
    const toggleMute = (): void => {
        if (stream) {
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted((prev) => !prev);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#2e2e2e] text-white">
            <div
                style={{
                    height: "20px",
                    width: "100%",
                    backgroundColor: "#424242",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    color: "white",
                }}
            >
                <span>OnixIDE</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-lg mb-4">Audio Call</h1>
                {isCallActive ? (
                    <div>
                        <button onClick={endCall} className="bg-red-500 px-4 py-2 rounded">
                            End Call
                        </button>
                        <button
                            onClick={toggleMute}
                            className="bg-gray-500 px-4 py-2 rounded ml-2"
                        >
                            {isMuted ? "Unmute" : "Mute"}
                        </button>
                    </div>
                ) : (
                    <button onClick={startCall} className="bg-green-500 px-4 py-2 rounded">
                        Start Call
                    </button>
                )}
            </div>
            <audio ref={audioRef} autoPlay playsInline hidden />
        </div>
    );
};

export default Audio;

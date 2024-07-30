"use client";

import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";

const PeerPage = () => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const callingVideoRef = useRef<HTMLVideoElement>(null);

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myUniqueId, setMyUniqueId] = useState<string>("");
  const [idToCall, setIdToCall] = useState("");
  const [currentCall, setCurrentCall] = useState<MediaConnection | null>(null);

  const generateRandomString = () => Math.random().toString(36).substring(2);

  const handleCall = () => {
    try {
      navigator?.mediaDevices
        ?.getUserMedia({
          video: true,
          audio: false,
        })
        .then((stream) => {
          const call = peerInstance?.call(idToCall, stream);
          if (call) {
            setCurrentCall(call);
            call.on("stream", (userVideoStream) => {
              if (callingVideoRef.current) {
                callingVideoRef.current.srcObject = userVideoStream;
              }
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleHangUp = () => {
    if (currentCall) {
      currentCall.close();
      setCurrentCall(null);
      if (callingVideoRef.current) {
        callingVideoRef.current.srcObject = null;
      }
    }
  };

  useEffect(() => {
    if (myUniqueId) {
      let peer: Peer;
      if (typeof window !== "undefined") {
        peer = new Peer(myUniqueId, {
          host: "192.168.1.9",
          port: 9000,
          path: "/myapp",
        });

        setPeerInstance(peer);

        navigator.mediaDevices
          ?.getUserMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
            if (myVideoRef.current) {
              myVideoRef.current.srcObject = stream;
            }

            peer.on("call", (call) => {
              call.answer(stream);
              setCurrentCall(call);
              call.on("stream", (userVideoStream) => {
                if (callingVideoRef.current) {
                  callingVideoRef.current.srcObject = userVideoStream;
                }
              });
            });
          });
      }
      return () => {
        if (peer) {
          peer.destroy();
        }
      };
    }
  }, [myUniqueId]);

  useEffect(() => {
    setMyUniqueId(generateRandomString());
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-12">
      <p>Your ID: {myUniqueId}</p>
      <video className="w-72" playsInline ref={myVideoRef} autoPlay />
      <input
        className="text-black"
        placeholder="ID to call"
        value={idToCall}
        onChange={(e) => setIdToCall(e.target.value)}
      />
      <button onClick={handleCall}>Call</button>
      <button className="mt-5 p-5 bg-red-500 text-white" onClick={handleHangUp} disabled={!currentCall}>
        Hang Up
      </button>
      <video className="w-72" playsInline ref={callingVideoRef} autoPlay />
    </div>
  );
};

export default PeerPage;

import { useState } from "react";
import { RadioTower } from "lucide-react";

export function RemoteAssist() {
  const [status, setStatus] = useState("idle");

  const connect = async () => {
    setStatus("allocating peer connection");
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peer.createDataChannel("cosmic-repair-remote-assist");
    peer.onicecandidate = () => {
      setTimeout(() => setStatus("collecting ICE candidates without timeout fallback"), 4200);
    };
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    setStatus("collecting ICE candidates");
  };

  return (
    <section className="glass-panel remote-panel">
      <div className="panel-title">
        <RadioTower size={18} />
        <h2>Remote Assist</h2>
      </div>
      <p>{status}</p>
      <button className="secondary-action" onClick={connect}>Start WebRTC Link</button>
    </section>
  );
}

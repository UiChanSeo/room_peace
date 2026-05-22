import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import PetModel from "./PetModel";
import { AmbientParticles, PetShadow, DynamicLights } from "./PetSceneShared";

export default function PetRoom() {
  const [mood, setMood] = useState<"happy" | "excited" | "sleep" | "lonely" | "stressed" | "idle">("idle");

  const getMoodTitle = () => {
    switch (mood) {
      case "happy": return "💖 Happy";
      case "excited": return "🔥 Excited";
      case "sleep": return "😴 Sleeping";
      case "lonely": return "🥺 Lonely";
      case "stressed": return "⚡ Stressed";
      default: return "🍃 Idle";
    }
  };

  return (
    <div style={{ 
      position: "relative",
      width: "100%", 
      height: "100vh",
      background: mood === "sleep" || mood === "stressed" 
        ? "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)" 
        : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      overflow: "hidden",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      transition: "background 1s ease"
    }}>
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 1.0, 4.2] }}>
        <DynamicLights mood={mood} />
        
        {/* Soft shadow underneath the pet */}
        <PetShadow mood={mood} />
        
        {/* Cozy ambient particle sparkles */}
        <AmbientParticles />

        <PetModel mood={mood} />

        <OrbitControls 
          enableZoom={true} 
          minDistance={1.8}
          maxDistance={8}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />
      </Canvas>

      {/* Floating Glassmorphic UI */}
      <div style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "420px",
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        padding: "20px 24px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        color: "#ffffff",
        zIndex: 10
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              🐾 코코의 3D 방 (테스트 룸)
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
              드래그하여 3D 펫과 방 조명을 테스트하세요
            </p>
          </div>
          <span style={{ 
            fontSize: "0.68rem", 
            fontWeight: 850, 
            background: "rgba(255, 255, 255, 0.15)", 
            padding: "4px 8px", 
            borderRadius: "8px",
            color: mood === "happy" || mood === "excited" ? "#fbbf24" : "#a5b4fc"
          }}>
            {getMoodTitle()}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />

        {/* Mood Selector Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <button 
            onClick={() => setMood("happy")}
            style={{
              background: mood === "happy" ? "#f59e0b" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            💖 신남
          </button>
          <button 
            onClick={() => setMood("excited")}
            style={{
              background: mood === "excited" ? "#ef4444" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🔥 흥분
          </button>
          <button 
            onClick={() => setMood("sleep")}
            style={{
              background: mood === "sleep" ? "#6366f1" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            😴 졸림
          </button>
          <button 
            onClick={() => setMood("lonely")}
            style={{
              background: mood === "lonely" ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🥺 외롭
          </button>
          <button 
            onClick={() => setMood("stressed")}
            style={{
              background: mood === "stressed" ? "#9b2c2c" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            ⚡ 스트레스
          </button>
          <button 
            onClick={() => setMood("idle")}
            style={{
              background: mood === "idle" ? "#10b981" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "10px 4px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🍃 평온
          </button>
        </div>
      </div>
    </div>
  );
}

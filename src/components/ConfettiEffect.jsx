"use client";
import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const ConfettiEffect = ({ visible }) => {
  const [confettiVisible, setConfettiVisible] = useState(visible);
  const { width, height } = useWindowSize(); // Get window dimensions for responsive confetti

  useEffect(() => {
    if (visible) {
      setConfettiVisible(true);
      const timer = setTimeout(() => {
        setConfettiVisible(false);
      }, 5000); // Confetti lasts for 10 seconds

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return confettiVisible ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999, // High z-index to ensure it stays on top
        pointerEvents: "none", // Prevents the confetti from blocking interactions
      }}
    >
      <Confetti
        width={width}
        height={height}
        numberOfPieces={1000} // Number of confetti pieces
        gravity={0.3} // How fast confetti falls (lower values = slower)
        wind={0.01} // Horizontal drift (positive values drift right)
        colors={["#FFC700", "#FF0000", "#14FF00", "#00CFFF"]} // Custom colors
        recycle={false} // Stop recycling after 10 seconds
      />
    </div>
  ) : null;
};

export default ConfettiEffect;

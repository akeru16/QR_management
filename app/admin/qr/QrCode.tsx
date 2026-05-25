"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export function QrCode({ expiresAt, value }: { expiresAt: string; value: string }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        window.location.reload();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="space-y-4">
      <QRCodeSVG
        bgColor="#ffffff"
        fgColor="#1f2933"
        includeMargin
        level="M"
        size={260}
        value={value}
      />
      <p className="text-sm font-semibold text-gray-700">
        有効期限 {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

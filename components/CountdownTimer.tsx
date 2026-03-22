"use client";

import { useState, useEffect } from "react";

const WEDDING_DATE = process.env.NEXT_PUBLIC_WEDDING_DATE || "2026-11-28T16:30:00";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const wedding = new Date(WEDDING_DATE).getTime();
  const diff = wedding - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-lg border border-olive/30 bg-cream/90 px-6 py-4 shadow-md backdrop-blur-sm min-w-[80px]"
        >
          <span className="font-heading text-3xl md:text-4xl font-semibold text-brown">
            {pad(value)}
          </span>
          <span className="text-sm text-olive/80 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

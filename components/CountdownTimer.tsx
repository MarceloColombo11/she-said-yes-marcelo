"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft {
  const now = new Date().getTime();
  const wedding = new Date(target).getTime();
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

/** `target` is an ISO timestamp of the ceremony start. */
export function CountdownTimer({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTimeLeft(getTimeLeft(target));
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const cards = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center rounded-lg border border-olive/30 bg-cream/90 w-[80px] sm:w-[96px] py-3 sm:py-4 shadow-md backdrop-blur-sm shrink-0"
        >
          <span className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-brown tabular-nums inline-block w-[3ch] text-center">
            {label === "Dias" ? String(value) : pad(value)}
          </span>
          <span className="text-xs sm:text-sm text-olive mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

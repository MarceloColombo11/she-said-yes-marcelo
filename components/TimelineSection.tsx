"use client";

import { Timeline } from "./Timeline";
import type { TimelineEvent } from "./Timeline";

interface TimelineSectionProps {
  title: string;
  subtitle: string;
  events: TimelineEvent[];
}

export function TimelineSection({ title, subtitle, events }: TimelineSectionProps) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-semibold text-brown md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-pretty text-olive">
          {subtitle}
        </p>
      </div>
      <Timeline events={events} />
    </div>
  );
}

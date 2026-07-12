import { Clock, ListChecks, Award } from "lucide-react";

type Stat = {
  icon: "time" | "questions" | "marks";
  value: string;
};

const ICONS = {
  time: Clock,
  questions: ListChecks,
  marks: Award,
};

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex h-8 items-center rounded border border-border-light">
      {stats.map((stat, i) => {
        const Icon = ICONS[stat.icon];
        return (
          <div key={stat.icon} className="flex items-center">
            <div className="flex items-center gap-2 px-base10">
              <Icon className="h-4 w-4 text-text-disabled" strokeWidth={2} />
              <span className="text-small-body text-text-secondary">{stat.value}</span>
            </div>
            {i < stats.length - 1 && (
              <span className="text-border-light select-none">|</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

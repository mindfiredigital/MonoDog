import { STAT_CARDS } from "../../main-dashboard/constants/pipeline";
import { ReleaseStatsProps } from "../types/release.types";
export function ReleaseStats({ stats, fetchPipelines }: ReleaseStatsProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
            Release Control Room
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Real-time Release Pipeline Manager
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            Watch GitHub Actions release workflows, inspect logs by job and step,
            and dispatch reruns without leaving MonoDog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchPipelines(true)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-400 hover:text-primary-700"
        >
          Refresh now 
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {STAT_CARDS.map(({ label, key, description }) => (
          <div key={label} className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {label}
            </p>
            <p className="mt-3 text-3xl font-bold text-neutral-900">
              {stats[key]}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

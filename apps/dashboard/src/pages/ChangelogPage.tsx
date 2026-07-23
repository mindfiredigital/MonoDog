import { useState, useEffect } from 'react';
import { monorepoService } from '../services/monorepoService';
import { ChangelogViewer } from '../components/publish-control/components';
import { ArrowPathIcon } from '../icons/heroicons';

export default function ChangelogPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const pkgs = await monorepoService.getPackages();
        setPackages(pkgs);
        if (pkgs.length > 0) {
          setSelectedPackage(pkgs[0].name);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-neutral-200" />
          <div className="h-12 w-full rounded bg-neutral-100" />
          <div className="h-64 w-full rounded bg-neutral-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-2xl">Changelogs</h1>
          <p className="text-caption mt-1">
            View release history and changelogs for all packages
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex items-center space-x-2 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-neutral-700">Package:</label>
        <select
          className="input-base bg-white"
          value={selectedPackage}
          onChange={e => setSelectedPackage(e.target.value)}
        >
          {packages.map(pkg => (
            <option key={pkg.name} value={pkg.name}>
              {pkg.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPackage && <ChangelogViewer packageName={selectedPackage} />}
    </div>
  );
}

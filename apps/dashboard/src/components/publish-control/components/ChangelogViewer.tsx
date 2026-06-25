import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ReleaseData } from '../../../../../../packages/backend/src/types/changelog.types';
import apiClient from '../../../services/api';
import { ChangelogViewerProps } from '../types/publish.types';
import { PlayIcon } from '../../../icons/heroicons';

const ChangelogViewer: React.FC<ChangelogViewerProps> = ({ packageName }) => {
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Version Filter State
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [showCommits, setShowCommits] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchChangelog = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<ReleaseData[]>(
          `/changelog/${encodeURIComponent(packageName)}`
        );

        if (response.success) {
          setReleases(response.data);
        } else {
          setError('Failed to fetch changelog');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (packageName) {
      fetchChangelog();
    }
  }, [packageName]);

  const toggleCommits = (version: string) => {
    setShowCommits(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  if (loading)
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-8 w-32 rounded bg-neutral-200" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card overflow-hidden">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 rounded bg-neutral-200" />
                <div className="h-4 w-24 rounded bg-neutral-100" />
              </div>
              <div className="h-5 w-14 rounded-full bg-neutral-100" />
            </div>
            <div className="p-6 space-y-3">
              <div className="h-4 w-full rounded bg-neutral-100" />
              <div className="h-4 w-3/4 rounded bg-neutral-100" />
              <div className="h-4 w-1/2 rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  if (releases.length === 0)
    return (
      <div className="p-4 text-gray-500 italic">
        No release history found for {packageName}.
      </div>
    );

  // Filter Logic
  const displayedReleases =
    selectedVersion === 'all'
      ? releases
      : releases.filter(r => r.version === selectedVersion);

  return (
    <div className="card overflow-hidden w-full">
      <div className="bg-neutral-50 px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-heading text-xl">Release History</h2>
        <select
          className="input-base bg-white"
          value={selectedVersion}
          onChange={e => setSelectedVersion(e.target.value)}
        >
          <option value="all">All Versions</option>
          {releases.map(r => (
            <option key={r.version} value={r.version}>
              v{r.version}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {displayedReleases.map(release => (
          <div key={release.version} className="card overflow-hidden">
            {/* Release Header */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-heading text-primary-600 text-lg">
                  v{release.version}
                </span>
                {release.date && (
                  <span className="text-caption">
                    {new Date(release.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <span className="badge-neutral">{release.author}</span>
            </div>

            {/* Markdown Body */}
            <div className="p-6 prose prose-blue max-w-none text-gray-700 prose-table:w-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {release.markdownBody || '*No release notes available.*'}
              </ReactMarkdown>
            </div>

            {/* Commits Section */}
            {release.commits && release.commits.length > 0 && (
              <div className="border-t border-neutral-200">
                <button
                  onClick={() => toggleCommits(release.version)}
                  className="w-full bg-neutral-50 px-6 py-3 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <span className="text-caption font-semibold tracking-wider flex items-center gap-2">
                    <PlayIcon
                      variant="solid"
                      className={`w-4 h-4 text-primary-600 transition-transform duration-200 ${
                        showCommits.has(release.version)
                          ? 'rotate-90'
                          : 'rotate-0'
                      }`}
                    />
                    Associated Commits ({release.commits.length})
                  </span>
                </button>

                {showCommits.has(release.version) && (
                  <div className="bg-neutral-50 px-6 py-4">
                    <ul className="space-y-2">
                      {release.commits.map((commit: any) => (
                        <li key={commit.hash} className="flex gap-3 text-sm">
                          <span className="text-code bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
                            {commit.hash.substring(0, 7)}
                          </span>
                          <span className="text-body">{commit.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangelogViewer;

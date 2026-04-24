export interface ReleaseStatsProps {
    stats: {
        total: number;
        running: number;
        queued: number;
        failed: number;
    };
    fetchPipelines: (keepLoading?: boolean) => void;
}
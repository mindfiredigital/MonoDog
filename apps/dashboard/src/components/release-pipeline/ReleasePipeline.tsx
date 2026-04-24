import { useAuth } from '../../services/auth-context';
import { useReleasePipeline } from './components/useReleasePipeline';
import { ReleaseStats } from './components/ReleaseStats';
import { PipelineSidebar } from './components/PipelineSidebar';
import { PipelineDetails } from './components/PipelineDetails';
import { ManualDispatch } from './components/ManualDispatch';
import { JobList } from './components/JobList';
import { JobLogs } from './components/JobLogs';
import { AuditSidebar } from './components/AuditSidebar';

export default function ReleasePipeline() {
  const { hasPermission } = useAuth();
  
  const {
    pipelines,
    auditLogs,
    workflows,
    selectedPipelineId,
    setSelectedPipelineId,
    selectedJobId,
    setSelectedJobId,
    selectedLogs,
    expandedSteps,
    setExpandedSteps,
    loading,
    logsLoading,
    actionLoading,
    error,
    triggerRef,
    setTriggerRef,
    selectedWorkflowId,
    setSelectedWorkflowId,
    triggerInputs,
    setTriggerInputs,
    selectedPipeline,
    selectedJob,
    stats,
    fetchPipelines,
    fetchJobLogs,
    handleTriggerWorkflow,
    handleRunAction,
  } = useReleasePipeline();

  if (loading) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-10 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-neutral-200" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReleaseStats stats={stats} fetchPipelines={fetchPipelines} />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <PipelineSidebar
          pipelines={pipelines}
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
        />

        <section className="space-y-6">
          {!selectedPipeline && (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
              Select a release pipeline to inspect workflow runs and logs.
            </div>
          )}

          {selectedPipeline && (
            <>
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
                <PipelineDetails
                  selectedPipeline={selectedPipeline}
                  actionLoading={actionLoading}
                  handleRunAction={handleRunAction}
                  hasPermission={hasPermission}
                />

                {hasPermission('maintain') && (
                  <ManualDispatch
                    workflows={workflows}
                    selectedWorkflowId={selectedWorkflowId}
                    setSelectedWorkflowId={setSelectedWorkflowId}
                    triggerRef={triggerRef}
                    setTriggerRef={setTriggerRef}
                    triggerInputs={triggerInputs}
                    setTriggerInputs={setTriggerInputs}
                    handleTriggerWorkflow={handleTriggerWorkflow}
                    actionLoading={actionLoading}
                  />
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <JobList
                  jobs={selectedPipeline.jobs}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                />

                <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
                  {!selectedJob && (
                    <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                      Select a job to inspect step-level logs.
                    </div>
                  )}

                  {selectedJob && (
                    <JobLogs
                      selectedJob={selectedJob}
                      selectedLogs={selectedLogs}
                      expandedSteps={expandedSteps}
                      setExpandedSteps={setExpandedSteps}
                      fetchJobLogs={fetchJobLogs}
                      logsLoading={logsLoading}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        <AuditSidebar auditLogs={auditLogs} />
      </div>
    </div>
  );
}

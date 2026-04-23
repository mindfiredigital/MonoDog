import { ManualDispatchProps } from '../types/pipeline-sidebar.props';

export function ManualDispatch({
  workflows,
  selectedWorkflowId,
  setSelectedWorkflowId,
  triggerRef,
  setTriggerRef,
  triggerInputs,
  setTriggerInputs,
  handleTriggerWorkflow,
  actionLoading,
}: ManualDispatchProps) {
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-neutral-900">Manual Dispatch</h3>
          <p className="text-sm text-neutral-600">
            Trigger a workflow dispatch directly from MonoDog.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700">
            Workflow
            <select
              value={selectedWorkflowId}
              onChange={event => setSelectedWorkflowId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name} ({workflow.path})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Ref
            <input
              value={triggerRef}
              onChange={event => setTriggerRef(event.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-neutral-700">
          Inputs JSON
          <textarea
            value={triggerInputs}
            onChange={event => setTriggerInputs(event.target.value)}
            rows={6}
            className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
          />
        </label>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleTriggerWorkflow}
          disabled={actionLoading === 'trigger' || !selectedWorkflowId}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {actionLoading === 'trigger' ? 'Dispatching...' : 'Trigger Workflow'}
        </button>
      </div>
    </div>
  );
}

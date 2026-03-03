
/**
 * Basic sanity tests for pipeline components and helper functions.
 */

import React from 'react';
import PipelineManager, {
  parseStepsFromLogs,
  getStatusIcon,
} from '../src/components/pipeline/PipelineManager';
import LogViewer from '../src/components/pipeline/LogViewer';
import WorkflowRunsList from '../src/components/pipeline/WorkflowRunsList';
import WorkflowTrigger from '../src/components/pipeline/WorkflowTrigger';
import JobsList from '../src/components/pipeline/JobsList';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '../src/icons';

// simply verify components can be imported
describe('Pipeline components exist', () => {
  const components = [
    PipelineManager,
    LogViewer,
    WorkflowRunsList,
    WorkflowTrigger,
    JobsList,
  ];

  components.forEach((Comp) => {
    test(`${Comp.name || 'Component'} is defined`, () => {
      expect(Comp).toBeDefined();
      expect(typeof Comp).toBe('function');
    });
  });
});

describe('parseStepsFromLogs helper', () => {
  const sampleLogs = `##[group]First step
line a1
line a2
##[endgroup]
##[group]Second step
line b
  indented line
##[endgroup]`;

  it('produces correct step array with names and logs', () => {
    const steps = parseStepsFromLogs(sampleLogs);
    expect(steps.length).toBe(2);
    expect(steps[0].name).toBe('First step');
    expect(steps[0].logs).toEqual(['line a1', 'line a2']);
    expect(steps[1].name).toBe('Second step');
    expect(steps[1].logs).toContain('line b');
    // ensure indentation didn't break anything
    expect(steps[1].logs).toContain('  indented line');
  });

  it('returns empty array for empty input', () => {
    const empty = parseStepsFromLogs('');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
  });
});

describe('getStatusIcon helper', () => {
  it('returns success icon for completed + success', () => {
    const el = getStatusIcon('completed', 'success');
    expect(el.type).toBe(CheckCircleIcon);
  });

  it('returns failure icon for completed + failure', () => {
    const el = getStatusIcon('completed', 'failure');
    expect(el.type).toBe(ExclamationCircleIcon);
  });

  it('returns cancelled icon for completed + cancelled', () => {
    const el = getStatusIcon('completed', 'cancelled');
    expect(el.type).toBe(XCircleIcon);
  });

  it('returns clock icon when in progress or queued', () => {
    const el1 = getStatusIcon('in_progress', null);
    const el2 = getStatusIcon('queued', null);
    expect(el1.type).toBe(ClockIcon);
    expect(el2.type).toBe(ClockIcon);
  });

  it('returns spinning clock when updating', () => {
    const el = getStatusIcon('in_progress', null, true);
    expect(el.type).toBe(ClockIcon);
    // look for animate-spin in className prop
    expect(el.props.className).toContain('animate-spin');
  });
});

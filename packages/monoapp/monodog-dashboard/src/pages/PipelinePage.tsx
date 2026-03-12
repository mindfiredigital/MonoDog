import React, {useState} from 'react';
import PipelineManager from '../components/pipeline/PipelineManager';
import { useAuth } from '../services/auth-context';

export default function PipelinePage() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Please sign in to view pipelines</p>
      </div>
    );
  }


  return (
    <div className="h-screen overflow-hidden">
      <PipelineManager />
    </div>
  );
}

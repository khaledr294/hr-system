'use client';

import { WorkerList } from './WorkerList';
import { type Worker } from '@/types/worker';

interface ClientWorkerListProps {
  workers: Worker[];
}

export function ClientWorkerList({ workers }: ClientWorkerListProps) {
  return <WorkerList workers={workers} />;
}

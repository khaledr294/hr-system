'use client';

import dynamic from 'next/dynamic';
import { type Worker } from '@/types/worker';

interface ClientWorkerListProps {
  workers: Worker[];
}

const DynamicWorkerList = dynamic<ClientWorkerListProps>(
  () => import('./WorkerList').then((mod) => mod.WorkerList),
  {
    ssr: false,
  }
);

export default function ClientWorkerList({ workers }: ClientWorkerListProps) {
  return <DynamicWorkerList workers={workers} />;
}
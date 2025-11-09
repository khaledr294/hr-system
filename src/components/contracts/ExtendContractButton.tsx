"use client";

import { useRouter } from 'next/navigation';

interface ExtendContractButtonProps {
  contractId: string;
  isActive: boolean;
}

export default function ExtendContractButton({ 
  contractId, 
  isActive 
}: ExtendContractButtonProps) {
  const router = useRouter();

  if (!isActive) {
    return null;
  }

  const handleExtendContract = () => {
    router.push(`/contracts/${contractId}/extend`);
  };

  return (
    <button
      onClick={handleExtendContract}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      تمديد العقد
    </button>
  );
}

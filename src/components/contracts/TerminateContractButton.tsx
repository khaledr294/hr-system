"use client";
import React from "react";

interface TerminateContractButtonProps {
  contractId: string;
}

export default function TerminateContractButton({ contractId }: TerminateContractButtonProps) {
  const [loading, setLoading] = React.useState(false);
  return (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      disabled={loading}
      onClick={async () => {
        if (!confirm('هل أنت متأكد من إنهاء العقد؟')) return;
        setLoading(true);
        const res = await fetch(`/api/contracts/${contractId}/terminate`, { method: 'POST' });
        setLoading(false);
        if (res.ok) {
          window.location.reload();
        } else {
          alert('تعذر إنهاء العقد.');
        }
      }}
    >
      {loading ? 'جاري الإنهاء...' : 'إنهاء العقد'}
    </button>
  );
}

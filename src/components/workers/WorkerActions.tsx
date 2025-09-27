"use client";

interface WorkerActionsProps {
  workerId: string;
}

export default function WorkerActions({ workerId }: WorkerActionsProps) {
  return (
    <div className="mb-4 flex justify-end gap-2">
      <form method="GET" action={`/workers/${workerId}/edit`}>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          تعديل
        </button>
      </form>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        onClick={async () => {
          if (confirm('هل أنت متأكد من حذف العاملة؟')) {
            const res = await fetch(`/api/workers/${workerId}`, { method: 'DELETE' });
            if (res.ok) {
              if (typeof window !== 'undefined') {
                window.location.href = '/workers';
              }
            } else {
              alert('تعذر حذف العاملة. تأكد من عدم وجود عقود نشطة.');
            }
          }
        }}
      >
        حذف
      </button>
    </div>
  );
}

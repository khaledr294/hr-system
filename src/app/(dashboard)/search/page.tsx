'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { Search, Filter, User, FileText, Users, Calendar } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'worker' | 'client' | 'contract';
  name: string;
  details: string;
  metadata: Record<string, unknown>;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ 
        q: searchTerm,
        entities: searchType === 'all' ? 'workers,clients,contracts' : searchType === 'worker' ? 'workers' : searchType === 'client' ? 'clients' : 'contracts'
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // تحويل البيانات إلى صيغة موحدة
        const allResults: SearchResult[] = [];
        
        if (data.workers) {
          data.workers.forEach((w: any) => {
            allResults.push({
              id: w.id,
              type: 'worker',
              name: w.name,
              details: `الجنسية: ${w.nationality} | الحالة: ${w.status} | رقم الجواز: ${w.passportNumber || '-'}`,
              metadata: w
            });
          });
        }
        
        if (data.clients) {
          data.clients.forEach((c: any) => {
            allResults.push({
              id: c.id,
              type: 'client',
              name: c.name,
              details: `الهاتف: ${c.phone} | رقم الهوية: ${c.idNumber} | عدد العقود: ${c.contractsCount}`,
              metadata: c
            });
          });
        }
        
        if (data.contracts) {
          data.contracts.forEach((c: any) => {
            allResults.push({
              id: c.id,
              type: 'contract',
              name: `عقد: ${c.workerName} - ${c.clientName}`,
              details: `الحالة: ${c.status} | المبلغ: ${c.totalAmount} ر.س | ${new Date(c.startDate).toLocaleDateString('ar-SA')}`,
              metadata: c
            });
          });
        }
        
        setResults(allResults);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worker': return <User className="w-5 h-5" />;
      case 'client': return <Users className="w-5 h-5" />;
      case 'contract': return <FileText className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'worker': return 'عامل';
      case 'client': return 'عميل';
      case 'contract': return 'عقد';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'worker': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white rounded-lg border-2 border-gray-200"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن أي شيء... (اسم، رقم، تفاصيل)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
            </div>
            <Button onClick={handleSearch} variant="primary" disabled={loading}>
              <div className="flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : <Search className="w-5 h-5" />}
                <span>بحث</span>
              </div>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="worker">العمال فقط</option>
              <option value="client">العملاء فقط</option>
              <option value="contract">العقود فقط</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="جاري البحث..." />
        </div>
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="لا توجد نتائج"
          description="لم يتم العثور على أي نتائج مطابقة لبحثك. جرب كلمات مفتاحية أخرى."
        />
      ) : searched ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm text-gray-600">
            تم العثور على {results.length} نتيجة
          </p>
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {result.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {result.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            ابدأ بالبحث عن عمال، عملاء، أو عقود
          </p>
        </div>
      )}
    </div>
  );
}


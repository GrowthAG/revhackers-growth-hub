
import { CheckCircle } from 'lucide-react';
import { CaseStudy } from '@/data/casesData';

interface CaseMetricsProps {
  caseData: CaseStudy;
}

const CaseMetrics = ({ caseData }: CaseMetricsProps) => {
  return (
    <div className="bg-[#f3ffcc] rounded-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {caseData.metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl font-bold text-black mb-2">{metric.value}</div>
            <div className="text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        {caseData.results.map((result, index) => (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="text-revgreen h-5 w-5 flex-shrink-0" />
            <span className="text-gray-800">{result}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseMetrics;

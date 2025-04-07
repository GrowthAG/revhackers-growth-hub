
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { casesData, CaseStudyKey } from '@/data/casesData';
import CaseNotFound from '@/components/cases/CaseNotFound';
import CaseHero from '@/components/cases/CaseHero';
import CaseContent from '@/components/cases/CaseContent';

const CasesDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const caseData = slug ? casesData[slug as CaseStudyKey] : null;

  if (!caseData) {
    return (
      <PageLayout>
        <CaseNotFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CaseHero caseData={caseData} />
      <CaseContent caseData={caseData} />
    </PageLayout>
  );
};

export default CasesDetalhe;

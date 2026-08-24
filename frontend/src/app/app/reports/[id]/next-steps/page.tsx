import { ReportNextSteps } from '@/components/report-next-steps';

export const metadata = { title: 'Next Steps · Basirah' };

export default async function NextStepsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportNextSteps incidentId={id} />;
}

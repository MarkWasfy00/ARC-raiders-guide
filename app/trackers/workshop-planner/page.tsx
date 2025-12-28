import { Metadata } from 'next';
import WorkshopPlanner from './WorkshopPlanner';
import { getWorkbenchItems } from './actions';

export const metadata: Metadata = {
  title: 'مخطط الورشة | دليل آرك رايدرز',
  description: 'خطط ترقيات الورشة الخاصة بك في آرك رايدرز. تتبع مستويات طاولات العمل والمتطلبات والعناصر المفتوحة.',
};

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function WorkshopPlannerPage() {
  const workbenchData = await getWorkbenchItems();

  return <WorkshopPlanner workbenchData={workbenchData} />;
}

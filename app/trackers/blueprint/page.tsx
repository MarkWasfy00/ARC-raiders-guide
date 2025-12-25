import { Metadata } from 'next';
import BlueprintTracker from './BlueprintTracker';

export const metadata: Metadata = {
  title: 'متتبع المخططات | دليل آرك رايدرز',
  description: 'تتبع المخططات التي حصلت عليها في آرك رايدرز. انقر على المخطط لوضع علامة عليه كمُحصّل.',
};

export default function BlueprintTrackerPage() {
  return <BlueprintTracker />;
}

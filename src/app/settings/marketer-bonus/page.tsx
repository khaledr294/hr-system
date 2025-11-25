import { requireHR } from '@/lib/require';
import MarketerBonusSettings from '@/components/settings/MarketerBonusSettings';

export default async function MarketerBonusSettingsPage() {
  await requireHR();

  return <MarketerBonusSettings />;
}

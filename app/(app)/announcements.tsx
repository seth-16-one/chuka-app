import { useEffect, useState } from 'react';

import { AnnouncementCard } from '@/components/ui/announcement-card';
import { PageHero } from '@/components/ui/page-hero';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { loadAnnouncements } from '@/services/content';
import { AnnouncementItem } from '@/services/types';

export default function AnnouncementsScreen() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    loadAnnouncements().then(setItems);
  }, []);

  return (
    <Screen>
      <PageHero
        className="mt-8"
        eyebrow="Announcements"
        title="Campus notices"
        subtitle="Important system, academic, and departmental updates for the university community."
      />

      <SectionHeader title="Latest updates" subtitle="Prioritized by urgency and relevance." />
      {items.map((item) => (
        <AnnouncementCard key={item.id} item={item} />
      ))}
    </Screen>
  );
}

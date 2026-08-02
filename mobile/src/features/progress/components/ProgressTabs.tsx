import { router, usePathname } from 'expo-router';

import { Button, Row } from '@/components';

const TABS = [
  { href: '/progress', label: 'Daily' },
  { href: '/progress/weekly', label: 'Weekly' },
  { href: '/progress/monthly', label: 'Monthly' },
] as const;

/** The Daily/Weekly/Monthly switcher at the top of every Progress view — mirrors web's `progress-tabs.tsx`, three links instead of one condensed screen. */
export function ProgressTabs() {
  const pathname = usePathname();

  return (
    <Row gap="sm">
      {TABS.map((tab) => (
        <Button
          key={tab.href}
          variant={pathname === tab.href ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => router.replace(tab.href)}
          style={{ flex: 1 }}
        >
          {tab.label}
        </Button>
      ))}
    </Row>
  );
}

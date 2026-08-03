import { router, usePathname } from 'expo-router';

import { Button, Row } from '@/components';

const TABS = [
  { href: '/workouts', label: 'Templates' },
  { href: '/workouts/history', label: 'History' },
  { href: '/workouts/progress', label: 'Progress' },
] as const;

/** The Templates/History/Progress switcher at the top of every Workouts sub-page — mirrors `features/progress/components/ProgressTabs.tsx`'s exact pattern. */
export function WorkoutsTabs() {
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

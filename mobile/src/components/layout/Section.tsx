import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

import { Label } from '../typography';
import { Column } from './Column';

export interface SectionProps {
  /** Rendered as a tracked uppercase `Label` above the content, matching the web app's section headers. Omit for an unlabeled group. */
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

/** Groups related content under an optional section label — the layout equivalent of the web app's `text-xs uppercase tracking-[...]` section headers. */
export function Section({ title, children, style }: SectionProps) {
  return (
    <Column gap="sm" style={style}>
      {title && <Label color="mutedForeground">{title}</Label>}
      <Column gap="base">{children}</Column>
    </Column>
  );
}

export type ComponentCategory =
  | 'layout'
  | 'typography'
  | 'surface'
  | 'button'
  | 'input'
  | 'feedback'
  | 'dialog'
  | 'dataviz'
  | 'icon';

export interface ComponentRegistryEntry {
  name: string;
  category: ComponentCategory;
  /** One line — what problem it solves, not what props it takes. */
  description: string;
}

/**
 * A catalog of every component in the design system, kept in one place so
 * the showcase screen and any future documentation/lint tooling can walk
 * the design system without re-deriving it from the filesystem. Add an
 * entry here whenever a new component is added to `src/components/`.
 */
export const COMPONENT_REGISTRY: ComponentRegistryEntry[] = [
  { name: 'Stack', category: 'layout', description: 'Base flex container — direction/gap/align/justify/wrap.' },
  { name: 'Row', category: 'layout', description: 'Stack fixed to horizontal.' },
  { name: 'Column', category: 'layout', description: 'Stack fixed to vertical.' },
  { name: 'Spacer', category: 'layout', description: 'Fixed-size gap between siblings.' },
  { name: 'Divider', category: 'layout', description: 'Hairline separator using the border token.' },
  { name: 'Screen', category: 'layout', description: 'Full-bleed background container.' },
  { name: 'SafeScreen', category: 'layout', description: 'Screen plus safe-area insets — the default screen root.' },
  { name: 'ScrollScreen', category: 'layout', description: 'SafeScreen plus a padded, keyboard-friendly ScrollView.' },
  { name: 'Section', category: 'layout', description: 'Groups content under an optional uppercase label.' },
  { name: 'Text', category: 'typography', description: 'Base text primitive — variant/weight/color/align.' },
  { name: 'Heading', category: 'typography', description: 'Text fixed to the heading variant.' },
  { name: 'Title', category: 'typography', description: 'Text fixed to the title variant.' },
  { name: 'Subtitle', category: 'typography', description: 'Text fixed to the subtitle variant.' },
  { name: 'Body', category: 'typography', description: 'Text fixed to the body variant.' },
  { name: 'Caption', category: 'typography', description: 'Text fixed to the caption variant.' },
  { name: 'Label', category: 'typography', description: 'Text fixed to the tracked-uppercase label variant.' },
  { name: 'Surface', category: 'surface', description: 'Base tone/padding/radius container.' },
  { name: 'Card', category: 'surface', description: 'Surface with optional press feedback, loading, and disabled states.' },
  { name: 'StatCard', category: 'surface', description: 'Card composed for a single labeled stat.' },
  { name: 'Button', category: 'button', description: 'The one button — every variation is a prop, not a new component.' },
  { name: 'Input', category: 'input', description: 'Base text field with adornment slots and error/helper text.' },
  { name: 'TextArea', category: 'input', description: 'Autosizing multiline input.' },
  { name: 'NumberInput', category: 'input', description: 'Input restricted to digits/decimals.' },
  { name: 'SearchInput', category: 'input', description: 'Input preconfigured with search/close adornments.' },
  { name: 'LoadingSpinner', category: 'feedback', description: 'Inline activity indicator.' },
  { name: 'Skeleton', category: 'feedback', description: 'Pulsing placeholder for loading content.' },
  { name: 'EmptyState', category: 'feedback', description: 'Nothing-here-yet message with an optional action.' },
  { name: 'ErrorState', category: 'feedback', description: 'Something-went-wrong message with an optional retry action.' },
  { name: 'ToastHost', category: 'dialog', description: 'Mounted once; renders toasts pushed via the toast store.' },
  { name: 'ConfirmationDialog', category: 'dialog', description: 'Modal-based yes/no confirmation.' },
  { name: 'Sheet', category: 'dialog', description: 'Modal-based bottom sheet for focused, single-purpose entry.' },
  { name: 'Sparkline', category: 'dataviz', description: 'Minimal bar-based trend visualization — no axes, no charting library.' },
  { name: 'Icon', category: 'icon', description: 'The one icon primitive — SF Symbols on iOS, Material Symbols elsewhere.' },
];

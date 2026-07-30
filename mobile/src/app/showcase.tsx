import { useState } from 'react';
import { View } from 'react-native';

import {
  Body,
  Button,
  Caption,
  Card,
  ConfirmationDialog,
  Divider,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  Input,
  Label,
  LoadingSpinner,
  NumberInput,
  Row,
  ScrollScreen,
  SearchInput,
  Section,
  Skeleton,
  StatCard,
  Subtitle,
  TextArea,
  Title,
  toast,
} from '@/components';
import { colors, radius, spacing } from '@/core/theme';

/**
 * Dev-only screen — not part of the real app navigation. Renders every
 * design-system component so visual consistency can be checked at a
 * glance whenever a new component is added or a token changes. Reach it
 * during development via `router.push('/showcase')` or by typing the URL
 * directly (`/showcase`) in the Expo web preview.
 */
export default function ShowcaseScreen() {
  const [textValue, setTextValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [journalValue, setJournalValue] = useState('');
  const [loadingButton, setLoadingButton] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <ScrollScreen>
      <Heading>Design System</Heading>

      <Section title="Typography">
        <Card>
          <Heading>Heading</Heading>
          <Title>Title</Title>
          <Subtitle>Subtitle</Subtitle>
          <Body>Body — the default for ordinary copy.</Body>
          <Caption color="mutedForeground">Caption — muted, small print.</Caption>
          <Label color="mutedForeground">Label</Label>
        </Card>
      </Section>

      <Section title="Colors">
        <Row wrap gap="sm">
          {(['primary', 'destructive', 'warning', 'card', 'popover', 'muted'] as const).map(
            (token) => (
              <View key={token} style={{ alignItems: 'center', gap: spacing.xs }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: radius.md,
                    backgroundColor: colors[token],
                  }}
                />
                <Caption color="mutedForeground">{token}</Caption>
              </View>
            ),
          )}
        </Row>
      </Section>

      <Section title="Buttons">
        <Row wrap gap="sm">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Row>
        <Row wrap gap="sm">
          <Button size="sm">Small</Button>
          <Button size="base">Base</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row wrap gap="sm" align="center">
          <Button leftIcon={<Icon name="plus" size={16} color={colors.primaryForeground} />}>
            With icon
          </Button>
          <Button
            loading={loadingButton}
            onPress={() => {
              setLoadingButton(true);
              setTimeout(() => setLoadingButton(false), 1500);
            }}
          >
            Tap to load
          </Button>
          <Button disabled>Disabled</Button>
          {/* icon-only: no children, an icon slot, and a required accessibilityLabel */}
          <Button
            variant="secondary"
            leftIcon={<Icon name="trash" size={16} color={colors.foreground} />}
            accessibilityLabel="Delete"
          />
        </Row>
      </Section>

      <Section title="Cards & Surfaces">
        <Card>
          <Body>A plain, non-pressable Card.</Body>
        </Card>
        <Card pressable onPress={() => toast.show('Card pressed')}>
          <Body>A pressable Card — press feedback + light haptic.</Body>
        </Card>
        <Card loading>
          <Body>You will not see this — loading shows a Skeleton instead.</Body>
        </Card>
        <StatCard label="Calories" value={2100} unit="kcal" />
        <Skeleton height={20} />
      </Section>

      <Section title="Inputs">
        <Input label="Name" placeholder="Jane Doe" value={textValue} onChangeText={setTextValue} />
        <Input label="With error" error="This field is required" />
        <NumberInput
          label="Weight"
          placeholder="70"
          value={numberValue}
          onChangeText={setNumberValue}
          allowDecimal
        />
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          onClear={() => setSearchValue('')}
        />
        <TextArea
          label="Journal"
          placeholder="Breakfast: protein muesli with milk..."
          value={journalValue}
          onChangeText={setJournalValue}
        />
      </Section>

      <Section title="Feedback">
        <Row gap="lg" align="center">
          <LoadingSpinner />
          <LoadingSpinner size="large" />
        </Row>
        <EmptyState
          title="No entries yet"
          description="Log your first meal to see it here."
          actionLabel="Add entry"
          onAction={() => toast.show('Add entry tapped')}
        />
        <ErrorState
          title="Couldn't load data"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => toast.error('Still broken')}
        />
      </Section>

      <Section title="Dialogs">
        <Row gap="sm">
          <Button variant="secondary" onPress={() => toast.success('Saved successfully')}>
            Show success toast
          </Button>
          <Button variant="secondary" onPress={() => setConfirmVisible(true)}>
            Show confirmation
          </Button>
        </Row>
      </Section>

      <Divider />
      <Caption color="mutedForeground">End of showcase.</Caption>

      <ConfirmationDialog
        visible={confirmVisible}
        title="Delete this entry?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmVisible(false);
          toast.show('Deleted');
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollScreen>
  );
}

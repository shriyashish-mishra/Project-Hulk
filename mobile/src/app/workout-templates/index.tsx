import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Body, Button, Caption, Card, Column, Icon, Row, ScrollScreen, Title } from '@/components';
import { colors } from '@/core/theme';
import { useWorkoutTemplates } from '@/features/workout-templates/hooks';
import { WorkoutSessionService } from '@/features/workout-sessions/services';

const NEW_TEMPLATE_DEFAULT_NAME = 'New Template';

/** The list glue screen the three approved mockups need to be reachable from — not one of the three itself. Tap a template to edit it; "Start" copies it straight into a new Active Session. */
export default function WorkoutTemplatesScreen() {
  const db = useSQLiteContext();
  const { templates, loading, createTemplate } = useWorkoutTemplates();
  const [creating, setCreating] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const template = await createTemplate(NEW_TEMPLATE_DEFAULT_NAME);
      router.push(`/workout-templates/${template.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleStart(templateId: number) {
    setStartingId(templateId);
    try {
      const session = await WorkoutSessionService.startFromTemplate(db, templateId);
      router.push(`/workout-session/${session.id}`);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button variant="ghost" size="sm" onPress={() => router.back()} accessibilityLabel="Back" leftIcon={<Icon name="chevronLeft" size={22} />} />
        <Title style={{ fontSize: 24 }}>Workout Templates</Title>
      </Row>

      {!loading && templates.length === 0 && (
        <Card>
          <Column gap="xs">
            <Body weight="semiBold">No templates yet</Body>
            <Caption color="mutedForeground">Build one once, reuse it every time you repeat the workout.</Caption>
          </Column>
        </Card>
      )}

      <Column gap="sm">
        {templates.map((template) => (
          <Card key={template.id}>
            <Row justify="space-between" align="center" gap="sm">
              <Card
                pressable
                onPress={() => router.push(`/workout-templates/${template.id}`)}
                padding="none"
                style={{ flex: 1, backgroundColor: 'transparent' }}
                accessibilityLabel={`Edit ${template.name}`}
              >
                <Column gap="xs">
                  <Body weight="semiBold">{template.name}</Body>
                  <Caption color="mutedForeground">Tap to edit</Caption>
                </Column>
              </Card>
              <Button
                size="sm"
                loading={startingId === template.id}
                leftIcon={<Icon name="check" color={colors.primaryForeground} size={14} />}
                onPress={() => handleStart(template.id)}
              >
                Start
              </Button>
            </Row>
          </Card>
        ))}
      </Column>

      <Button
        variant="secondary"
        fullWidth
        loading={creating}
        leftIcon={<Icon name="plus" color={colors.foreground} size={16} />}
        onPress={handleCreate}
      >
        New Template
      </Button>
    </ScrollScreen>
  );
}

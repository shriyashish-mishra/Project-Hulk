import { Component, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

interface CrashBoundaryProps {
  children: ReactNode;
}

interface CrashBoundaryState {
  error: Error | null;
  componentStack: string | null;
}

/**
 * Last-resort error boundary for the whole app. Without this, a
 * render-phase throw anywhere in the tree (including from
 * `SQLiteProvider`'s `onInit` re-throwing a migration failure) aborts
 * React's entire first commit, leaving nothing on screen and no visible
 * error. Built from bare RN primitives (no design-system components) so
 * it still renders even if the crash is inside the design system itself.
 */
export class CrashBoundary extends Component<CrashBoundaryProps, CrashBoundaryState> {
  state: CrashBoundaryState = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<CrashBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    this.setState({ componentStack: info.componentStack ?? null });
  }

  render() {
    const { error, componentStack } = this.state;
    if (error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#060606', paddingTop: 60, paddingHorizontal: 20 }}>
          <ScrollView>
            <Text style={{ color: '#57e5a9', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              Something crashed
            </Text>
            <Text selectable style={{ color: '#ffffff', fontSize: 14, marginBottom: 16 }}>
              {error.message}
            </Text>
            <Text selectable style={{ color: '#999999', fontSize: 11 }}>
              {error.stack}
            </Text>
            {componentStack && (
              <Text selectable style={{ color: '#666666', fontSize: 11, marginTop: 16 }}>
                {componentStack}
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

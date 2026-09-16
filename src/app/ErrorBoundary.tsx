import React from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';

type Props = {children: React.ReactNode};

type State = {error: Error | null};

// Deliberately free of theme/context dependencies: this has to render even when
// the failure came from a provider above the screen tree.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <Text style={styles.title}>Splyt hit a snag</Text>
          <Text style={styles.message}>
            Something went wrong while drawing this screen. Your data is safe —
            try again, and let us know if it keeps happening.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Try again"
            style={styles.button}
            onPress={() => this.setState({error: null})}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B6B6F',
  },
  button: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F57',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

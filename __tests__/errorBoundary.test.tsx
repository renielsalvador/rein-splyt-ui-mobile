import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {ErrorBoundary} from '../src/app/ErrorBoundary';

function Boom({explode}: {explode: boolean}) {
  if (explode) {
    throw new Error('render failure');
  }
  return <Text>Recovered content</Text>;
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Recovered content')).toBeTruthy();
  });

  it('shows the fallback instead of unmounting the app when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom explode={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Splyt hit a snag')).toBeTruthy();
    expect(consoleError).toHaveBeenCalled();
  });

  it('retries rendering when the fallback action is pressed', () => {
    const {rerender} = render(
      <ErrorBoundary>
        <Boom explode={true} />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>,
    );
    fireEvent.press(screen.getByLabelText('Try again'));

    expect(screen.getByText('Recovered content')).toBeTruthy();
  });
});

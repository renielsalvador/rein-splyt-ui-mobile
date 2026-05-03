import React from 'react';
import {StatusBar} from 'react-native';
import {AppRoot} from './src/app/navigation';
import {palette} from './src/theme/tokens';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={palette.canvas} />
      <AppRoot />
    </>
  );
}

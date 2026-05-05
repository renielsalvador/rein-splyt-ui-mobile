import React from 'react';
import {Text, View} from 'react-native';
import {palette, radii, typography} from '../../theme/tokens';

const AVATAR_COLORS = [
  {bg: '#DDEDE6', text: '#1B4332'},
  {bg: '#E8F0FE', text: '#2855AE'},
  {bg: '#FEE2E2', text: '#991B1B'},
  {bg: '#FEF3C7', text: '#92400E'},
  {bg: '#E0E7FF', text: '#3730A3'},
  {bg: '#FCE7F3', text: '#9D174D'},
  {bg: '#D1FAE5', text: '#065F46'},
  {bg: '#DBEAFE', text: '#1E40AF'},
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
};

const FONT_SIZE_MAP = {
  xs: 10,
  sm: 13,
  md: 15,
  lg: 18,
};

export function AppAvatar({
  name,
  size = 'sm',
  style,
}: {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  style?: object;
}) {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const colors = getAvatarColor(name);
  const initials = getInitials(name || '?');

  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: radii.pill,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Text
        style={{
          ...typography.caption,
          fontSize,
          fontWeight: '700',
          color: colors.text,
          lineHeight: fontSize + 2,
        }}>
        {initials}
      </Text>
    </View>
  );
}

export function AppAvatarStack({
  names,
  size = 'xs',
}: {
  names: string[];
  size?: 'xs' | 'sm';
}) {
  const dim = SIZE_MAP[size];
  const overlap = Math.floor(dim * 0.35);
  const visible = names.slice(0, 4);
  const overflow = names.length - 4;

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {visible.map((name, index) => (
        <AppAvatar
          key={name + index}
          name={name}
          size={size}
          style={[
            index > 0 && {marginLeft: -overlap},
            {borderWidth: 1.5, borderColor: palette.surface},
          ]}
        />
      ))}
      {overflow > 0 && (
        <View
          style={{
            width: dim,
            height: dim,
            borderRadius: radii.pill,
            backgroundColor: palette.bgApp,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -overlap,
            borderWidth: 1.5,
            borderColor: palette.surface,
          }}>
          <Text style={{fontSize: 9, fontWeight: '700', color: palette.inkMuted}}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

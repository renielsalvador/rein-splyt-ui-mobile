import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Modal, Pressable, Text, View} from 'react-native';
import {spacing, surfaces} from '../../theme/tokens';
import {AppIcon, IconButton, type AppIconName} from './AppIcon';
import {styles} from './styles';

export function AppMenu({
  items,
  renderTrigger,
}: {
  items: Array<{
    label: string;
    icon: AppIconName;
    onPress: () => void;
    disabled?: boolean;
  }>;
  renderTrigger?: (props: {open: boolean; toggle: () => void}) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({top: 52, left: 0});
  const triggerRef = useRef<View>(null);
  const toggle = () => setOpen(current => !current);

  useEffect(() => {
    if (!open) {
      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const cardWidth = 188;
      const nextLeft = Math.min(
        Math.max(spacing.md, x + width - cardWidth),
        screenWidth - cardWidth - spacing.md,
      );

      setMenuPosition({
        top: y + height + spacing.xs,
        left: nextLeft,
      });
    });
  }, [open]);

  return (
    <View style={styles.menuWrap}>
      <View ref={triggerRef} collapsable={false}>
        {renderTrigger ? (
          renderTrigger({open, toggle})
        ) : (
          <IconButton icon="menu" accessibilityLabel="Open menu" onPress={toggle} />
        )}
      </View>
      {open ? (
        <Modal transparent visible onRequestClose={() => setOpen(false)}>
          <View style={styles.menuModalLayer}>
            <Pressable style={styles.menuBackdrop} onPress={() => setOpen(false)} />
            <View
              style={[
                surfaces.card,
                styles.menuCard,
                {top: menuPosition.top, left: menuPosition.left},
              ]}>
              {items.map(item => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  disabled={item.disabled}
                  onPress={() => {
                    setOpen(false);
                    if (!item.disabled) {
                      item.onPress();
                    }
                  }}
                  style={({pressed}) => [
                    styles.menuItem,
                    item.disabled ? styles.buttonDisabled : null,
                    pressed ? styles.buttonPressed : null,
                  ]}>
                  <AppIcon name={item.icon} tone="accent" />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

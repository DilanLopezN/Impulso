import React from 'react';
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

type BaseProps = Omit<TextProps, 'style'> & {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

export const H1 = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'Geist_600SemiBold',
          fontSize: 32,
          letterSpacing: -0.96,
          lineHeight: 34,
          color: theme.ink[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const H2 = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'Geist_600SemiBold',
          fontSize: 24,
          letterSpacing: -0.48,
          lineHeight: 28,
          color: theme.ink[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const H3 = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'Geist_600SemiBold',
          fontSize: 18,
          letterSpacing: -0.18,
          color: theme.ink[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Body = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'Geist_400Regular',
          fontSize: 14,
          lineHeight: 21,
          color: theme.ink[1],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Small = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'Geist_400Regular',
          fontSize: 12,
          color: theme.ink[2],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Eyebrow = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'GeistMono_500Medium',
          fontSize: 10,
          letterSpacing: 1.8,
          color: theme.ink[2],
          textTransform: 'uppercase',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Mono = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: 'GeistMono_500Medium',
          color: theme.ink[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Neon = ({ style, children, ...rest }: BaseProps) => {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          color: theme.accent,
          textShadowColor: theme.accentGlow,
          textShadowRadius: 18,
          textShadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const styles = StyleSheet.create({});

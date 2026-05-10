import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export const AppText = (props) => {
  // We apply Inter_400Regular by default. 
  // If a standard fontWeight is used, we map it to the proper Inter variant,
  // because Inter requires explicitly setting the fontFamily variant for weights.
  const flatStyle = StyleSheet.flatten(props.style || {});
  
  let fontFamily = 'Inter_400Regular';
  
  if (flatStyle.fontWeight) {
    switch (String(flatStyle.fontWeight)) {
      case '300':
        fontFamily = 'Inter_300Light';
        break;
      case '500':
        fontFamily = 'Inter_500Medium';
        break;
      case 'bold':
      case '600':
      case '700':
        fontFamily = 'Inter_600SemiBold'; // or 700
        break;
      case '800':
      case '900':
        fontFamily = 'Inter_800ExtraBold';
        break;
      default:
        fontFamily = 'Inter_400Regular';
        break;
    }
  }

  // Override standard font weight with our custom font family because 
  // React Native might conflict if standard weight is used alongside custom font family.
  const customStyle = { ...flatStyle, fontFamily, fontWeight: undefined };

  return (
    <RNText {...props} style={customStyle}>
      {props.children}
    </RNText>
  );
};

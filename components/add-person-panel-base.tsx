import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import type { CreatePersonInput } from '@/types/reach';

export type AddPersonPanelProps = {
  companyControl: ReactNode;
  disabledButtonStyle?: StyleProp<ViewStyle>;
  dropOverlayColor?: string;
  dropOverlayRadius?: number;
  enabled?: boolean;
  fieldStyle?: StyleProp<ViewStyle>;
  inputStyle: StyleProp<TextStyle>;
  isSaving?: boolean;
  labelColor: string;
  saveIconColor: string;
  onChangeField: (field: keyof CreatePersonInput, value: string) => void;
  onImportFields: (fields: Partial<CreatePersonInput>) => void;
  onSave: () => void;
  placeholderColor: string;
  saveButtonStyle: StyleProp<ViewStyle>;
  saveTextStyle: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  value: CreatePersonInput;
};

export function AddPersonPanelBase({
  companyControl,
  disabledButtonStyle,
  fieldStyle,
  inputStyle,
  isSaving = false,
  labelColor,
  onChangeField,
  onSave,
  placeholderColor,
  saveButtonStyle,
  saveIconColor,
  saveTextStyle,
  style,
  value,
}: AddPersonPanelProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Full Name</Text>
        <TextInput
          onChangeText={(nextValue) => onChangeField('fullName', nextValue)}
          placeholder="Ryan Deame"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.fullName}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Title</Text>
        <TextInput
          onChangeText={(nextValue) => onChangeField('title', nextValue)}
          placeholder="Head of Growth"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.title}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Location</Text>
        <TextInput
          onChangeText={(nextValue) => onChangeField('location', nextValue)}
          placeholder="Bogota, Colombia"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.location}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(nextValue) => onChangeField('email', nextValue)}
          placeholder="ryan@example.com"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.email}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Phone</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={(nextValue) => onChangeField('phone', nextValue)}
          placeholder="+1 617 870 4615"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.phone}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>LinkedIn</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={(nextValue) => onChangeField('linkedin', nextValue)}
          placeholder="linkedin.com/in/..."
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.linkedin}
        />
      </View>

      {companyControl}

      <Pressable
        disabled={isSaving}
        onPress={onSave}
        style={[saveButtonStyle, isSaving && disabledButtonStyle]}>
        <MaterialIcons name="person-add-alt-1" size={18} color={saveIconColor} />
        <Text style={saveTextStyle}>{isSaving ? 'Saving...' : 'Save Person'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
    position: 'relative',
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});

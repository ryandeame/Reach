import { StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';

import type { CreateCompanyInput } from '@/types/reach';

type CompanyFormFieldsProps = {
  fieldStyle?: StyleProp<ViewStyle>;
  inputStyle: StyleProp<TextStyle>;
  labelColor: string;
  onChangeField: (field: keyof CreateCompanyInput, value: string) => void;
  placeholderColor: string;
  value: CreateCompanyInput;
};

export function CompanyFormFields({
  fieldStyle,
  inputStyle,
  labelColor,
  onChangeField,
  placeholderColor,
  value,
}: CompanyFormFieldsProps) {
  return (
    <>
      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Company name</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(nextValue) => onChangeField('name', nextValue)}
          placeholder="Northwind Creative"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.name}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Location</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(nextValue) => onChangeField('location', nextValue)}
          placeholder="Remote, Austin, TX, or Hybrid"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.location}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Phone</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={(nextValue) => onChangeField('phone', nextValue)}
          placeholder="(555) 555-0199"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.phone}
        />
      </View>

      <View style={[styles.field, fieldStyle]}>
        <Text style={[styles.label, { color: labelColor }]}>Website</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={(nextValue) => onChangeField('website', nextValue)}
          placeholder="https://northwindcreative.com"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          value={value.website}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
});

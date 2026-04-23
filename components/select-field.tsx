import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

export type SelectFieldVariant = 'default' | 'noir' | 'momentum' | 'glass' | 'precision';

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  placeholder: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
  variant?: SelectFieldVariant;
};

type SelectTheme = {
  label: string;
  triggerBackground: string;
  triggerBorder: string;
  triggerPressed: string;
  triggerText: string;
  placeholder: string;
  triggerIcon: string;
  overlay: string;
  sheetBackground: string;
  sheetBorder: string;
  sheetTitle: string;
  closeText: string;
  optionBackground: string;
  optionBorder: string;
  optionPressed: string;
  optionSelectedBackground: string;
  optionSelectedBorder: string;
  optionLabel: string;
  optionDescription: string;
  emptyText: string;
  checkmark: string;
  controlRadius: number;
  sheetRadius: number;
  closeRadius: number;
};

const themes: Record<SelectFieldVariant, SelectTheme> = {
  default: {
    label: '#213547',
    triggerBackground: '#FFFFFF',
    triggerBorder: '#C9D7E3',
    triggerPressed: '#0E7490',
    triggerText: '#102A43',
    placeholder: '#7B8794',
    triggerIcon: '#486581',
    overlay: 'rgba(15, 23, 42, 0.35)',
    sheetBackground: '#FDFDFB',
    sheetBorder: '#E3ECF3',
    sheetTitle: '#102A43',
    closeText: '#0E7490',
    optionBackground: '#FFFFFF',
    optionBorder: '#DAE4EC',
    optionPressed: '#0E7490',
    optionSelectedBackground: '#F0FDFA',
    optionSelectedBorder: '#14B8A6',
    optionLabel: '#102A43',
    optionDescription: '#486581',
    emptyText: '#7B8794',
    checkmark: '#0F766E',
    controlRadius: 18,
    sheetRadius: 28,
    closeRadius: 999,
  },
  noir: {
    label: '#E7DDEA',
    triggerBackground: '#1A1423',
    triggerBorder: '#473553',
    triggerPressed: '#F472B6',
    triggerText: '#FFF8FB',
    placeholder: '#9F90AE',
    triggerIcon: '#D5B9C8',
    overlay: 'rgba(4, 3, 8, 0.72)',
    sheetBackground: '#120E19',
    sheetBorder: '#34283F',
    sheetTitle: '#FFF6F8',
    closeText: '#F9A8D4',
    optionBackground: '#1A1423',
    optionBorder: '#473553',
    optionPressed: '#F472B6',
    optionSelectedBackground: '#261A30',
    optionSelectedBorder: '#F472B6',
    optionLabel: '#FFF8FB',
    optionDescription: '#BFAFCB',
    emptyText: '#A999B8',
    checkmark: '#FFD4DF',
    controlRadius: 18,
    sheetRadius: 28,
    closeRadius: 999,
  },
  momentum: {
    label: '#7C2D12',
    triggerBackground: '#FFFFFF',
    triggerBorder: '#F3C89A',
    triggerPressed: '#F97316',
    triggerText: '#7C2D12',
    placeholder: '#C08457',
    triggerIcon: '#C2410C',
    overlay: 'rgba(124, 45, 18, 0.28)',
    sheetBackground: '#FFFDF8',
    sheetBorder: '#F4DFC9',
    sheetTitle: '#7C2D12',
    closeText: '#EA580C',
    optionBackground: '#FFFFFF',
    optionBorder: '#F3C89A',
    optionPressed: '#F97316',
    optionSelectedBackground: '#FFF1D8',
    optionSelectedBorder: '#F97316',
    optionLabel: '#7C2D12',
    optionDescription: '#9A3412',
    emptyText: '#C08457',
    checkmark: '#EA580C',
    controlRadius: 18,
    sheetRadius: 28,
    closeRadius: 999,
  },
  glass: {
    label: '#12314A',
    triggerBackground: 'rgba(255, 255, 255, 0.9)',
    triggerBorder: 'rgba(125, 211, 252, 0.52)',
    triggerPressed: '#0891B2',
    triggerText: '#12314A',
    placeholder: '#6B93A9',
    triggerIcon: '#155E75',
    overlay: 'rgba(15, 23, 42, 0.42)',
    sheetBackground: 'rgba(255, 255, 255, 0.9)',
    sheetBorder: 'rgba(125, 211, 252, 0.44)',
    sheetTitle: '#12314A',
    closeText: '#0891B2',
    optionBackground: 'rgba(255, 255, 255, 0.9)',
    optionBorder: 'rgba(125, 211, 252, 0.36)',
    optionPressed: '#0891B2',
    optionSelectedBackground: 'rgba(236, 254, 255, 0.95)',
    optionSelectedBorder: '#22D3EE',
    optionLabel: '#12314A',
    optionDescription: '#365B71',
    emptyText: '#6B93A9',
    checkmark: '#0E7490',
    controlRadius: 18,
    sheetRadius: 28,
    closeRadius: 999,
  },
  precision: {
    label: '#DDE7EE',
    triggerBackground: 'rgba(14, 14, 15, 0.92)',
    triggerBorder: 'rgba(60, 73, 77, 0.95)',
    triggerPressed: '#00D8FF',
    triggerText: '#EEF8FF',
    placeholder: '#738592',
    triggerIcon: '#AEEBFF',
    overlay: 'rgba(5, 7, 10, 0.78)',
    sheetBackground: 'rgba(26, 26, 27, 0.94)',
    sheetBorder: 'rgba(0, 216, 255, 0.18)',
    sheetTitle: '#EEF8FF',
    closeText: '#AEEBFF',
    optionBackground: 'rgba(19, 19, 20, 0.92)',
    optionBorder: 'rgba(60, 73, 77, 0.88)',
    optionPressed: '#00D8FF',
    optionSelectedBackground: 'rgba(32, 63, 143, 0.38)',
    optionSelectedBorder: 'rgba(0, 216, 255, 0.56)',
    optionLabel: '#EEF8FF',
    optionDescription: '#A3B1BB',
    emptyText: '#738592',
    checkmark: '#AEEBFF',
    controlRadius: 10,
    sheetRadius: 12,
    closeRadius: 8,
  },
};

export function SelectField({
  label,
  options,
  placeholder,
  selectedValue,
  onValueChange,
  disabled = false,
  emptyMessage = 'No options available yet.',
  variant = 'default',
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = themes[variant];

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
        <Pressable
          disabled={disabled}
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.trigger,
            {
              backgroundColor: theme.triggerBackground,
              borderColor: theme.triggerBorder,
              borderRadius: theme.controlRadius,
            },
            disabled && styles.triggerDisabled,
            pressed && !disabled && { borderColor: theme.triggerPressed },
          ]}>
          <Text
            style={[
              styles.triggerText,
              { color: theme.triggerText },
              !selectedOption && { color: theme.placeholder },
            ]}>
            {selectedOption?.label ?? placeholder}
          </Text>
          <Text style={[styles.triggerIcon, { color: theme.triggerIcon }]}>v</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}>
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.sheetBackground,
                borderColor: theme.sheetBorder,
                borderRadius: theme.sheetRadius,
              },
            ]}>
            <View style={[styles.sheetHeader, { borderBottomColor: theme.sheetBorder }]}>
              <Text style={[styles.sheetTitle, { color: theme.sheetTitle }]}>{label}</Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                style={[styles.closeButton, { borderRadius: theme.closeRadius }]}>
                <Text style={[styles.closeButtonText, { color: theme.closeText }]}>Close</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.optionList}>
              {options.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.emptyText }]}>{emptyMessage}</Text>
              ) : null}

              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={option.value || option.label}
                    onPress={() => {
                      onValueChange(option.value);
                      setIsOpen(false);
                    }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: theme.optionBackground,
                      borderColor: theme.optionBorder,
                      borderRadius: theme.controlRadius,
                    },
                    isSelected && {
                      backgroundColor: theme.optionSelectedBackground,
                      borderColor: theme.optionSelectedBorder,
                    },
                    pressed && { borderColor: theme.optionPressed },
                  ]}>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionLabel, { color: theme.optionLabel }]}>
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text style={[styles.optionDescription, { color: theme.optionDescription }]}>
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Text style={[styles.checkmark, { color: theme.checkmark }]}>Selected</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: '#213547',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#C9D7E3',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  triggerDisabled: {
    backgroundColor: '#EEF3F7',
    opacity: 0.7,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  triggerIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    borderWidth: 1,
    borderRadius: 28,
    maxHeight: '75%',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    borderBottomColor: '#E3ECF3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sheetTitle: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionList: {
    gap: 10,
    padding: 16,
  },
  emptyText: {
    color: '#7B8794',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 12,
    textAlign: 'center',
  },
  option: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
  },
});

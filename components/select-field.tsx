import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  placeholder: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
};

export function SelectField({
  label,
  options,
  placeholder,
  selectedValue,
  onValueChange,
  disabled = false,
  emptyMessage = 'No options available yet.',
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          disabled={disabled}
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.trigger,
            disabled && styles.triggerDisabled,
            pressed && !disabled && styles.triggerPressed,
          ]}>
          <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
            {selectedOption?.label ?? placeholder}
          </Text>
          <Text style={styles.triggerIcon}>v</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.optionList}>
              {options.length === 0 ? <Text style={styles.emptyText}>{emptyMessage}</Text> : null}

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
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.description ? (
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      ) : null}
                    </View>
                    {isSelected ? <Text style={styles.checkmark}>Selected</Text> : null}
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
  triggerPressed: {
    borderColor: '#0E7490',
  },
  triggerText: {
    color: '#102A43',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  placeholder: {
    color: '#7B8794',
  },
  triggerIcon: {
    color: '#486581',
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
    backgroundColor: '#FDFDFB',
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
    color: '#0E7490',
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
    backgroundColor: '#FFFFFF',
    borderColor: '#DAE4EC',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionPressed: {
    borderColor: '#0E7490',
  },
  optionSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#14B8A6',
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: '#102A43',
    fontSize: 15,
    fontWeight: '600',
  },
  optionDescription: {
    color: '#486581',
    fontSize: 13,
    lineHeight: 18,
  },
  checkmark: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
  },
});

import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { CompanyFormFields } from '@/components/company-form-fields';
import type { CreateCompanyInput } from '@/types/reach';
import { useCompanyJsonDropImport } from '../hooks/use-company-json-drop-import';

type AddCompanyPanelProps = {
  dropOverlayColor: string;
  dropOverlayRadius?: number;
  enabled: boolean;
  cancelButtonStyle: StyleProp<ViewStyle>;
  cancelTextStyle: StyleProp<TextStyle>;
  disabledButtonStyle?: StyleProp<ViewStyle>;
  fieldStackStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  inputStyle: StyleProp<TextStyle>;
  labelColor: string;
  isSaving?: boolean;
  onCancel: () => void;
  onChangeField: (field: keyof CreateCompanyInput, value: string) => void;
  onImportFields: (fields: Partial<CreateCompanyInput>) => void;
  onSave: () => void;
  placeholderColor: string;
  saveButtonStyle: StyleProp<ViewStyle>;
  saveTextStyle: StyleProp<TextStyle>;
  savingLabel?: string;
  scrollContentStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  shouldScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  titleColor: string;
  topContent?: ReactNode;
  value: CreateCompanyInput;
};

export function AddCompanyPanel({
  dropOverlayColor,
  dropOverlayRadius = 28,
  enabled,
  cancelButtonStyle,
  cancelTextStyle,
  disabledButtonStyle,
  fieldStackStyle,
  footerStyle,
  inputStyle,
  labelColor,
  isSaving = false,
  onCancel,
  onChangeField,
  onImportFields,
  onSave,
  placeholderColor,
  saveButtonStyle,
  saveTextStyle,
  savingLabel = 'Saving...',
  scrollContentStyle,
  scrollStyle,
  shouldScroll = false,
  style,
  titleColor,
  topContent,
  value,
}: AddCompanyPanelProps) {
  const isDraggingJson = useCompanyJsonDropImport(enabled, onImportFields);

  const fields = (
    <View style={[styles.fieldStack, fieldStackStyle]}>
      {topContent}
      <CompanyFormFields
        inputStyle={inputStyle}
        labelColor={labelColor}
        onChangeField={onChangeField}
        placeholderColor={placeholderColor}
        value={value}
      />
    </View>
  );

  return (
    <View style={[styles.root, style]}>
      {isDraggingJson ? (
        <View
          pointerEvents="none"
          style={[
            styles.dropOverlay,
            {
              backgroundColor: `${dropOverlayColor}33`,
              borderColor: dropOverlayColor,
              borderRadius: dropOverlayRadius,
            },
          ]}>
          <Text style={[styles.dropOverlayText, { color: dropOverlayColor }]}>Drop file here</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={[styles.title, { color: titleColor }]}>Add company</Text>
      </View>

      {shouldScroll ? (
        <ScrollView
          style={scrollStyle}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          {fields}
        </ScrollView>
      ) : (
        fields
      )}

      <View style={footerStyle}>
        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={[styles.actionButton, cancelButtonStyle]}>
            <Text style={cancelTextStyle}>Cancel</Text>
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={onSave}
            style={[styles.actionButton, saveButtonStyle, isSaving && disabledButtonStyle]}>
            <Text style={saveTextStyle}>{isSaving ? savingLabel : 'Save company'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  fieldStack: {
    gap: 16,
  },
  header: {
    gap: 6,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  actionButton: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  dropOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    zIndex: 20,
  },
  dropOverlayText: {
    fontSize: 22,
    fontWeight: '900',
  },
});

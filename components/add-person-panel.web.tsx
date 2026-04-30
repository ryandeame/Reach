import { StyleSheet, Text, View } from 'react-native';

import { AddPersonPanelBase, type AddPersonPanelProps } from '@/components/add-person-panel-base';
import { usePersonJsonDropImport } from '@/hooks/use-person-json-drop-import';

export function AddPersonPanel(props: AddPersonPanelProps) {
  const isDraggingJson = usePersonJsonDropImport(
    Boolean(props.enabled),
    props.onImportFields,
  );
  const dropOverlayColor = props.dropOverlayColor ?? '#0a66c2';

  return (
    <View style={styles.root}>
      {isDraggingJson ? (
        <View
          pointerEvents="none"
          style={[
            styles.dropOverlay,
            {
              backgroundColor: `${dropOverlayColor}33`,
              borderColor: dropOverlayColor,
              borderRadius: props.dropOverlayRadius ?? 28,
            },
          ]}>
          <Text style={[styles.dropOverlayText, { color: dropOverlayColor }]}>Drop file here</Text>
        </View>
      ) : null}

      <AddPersonPanelBase {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
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

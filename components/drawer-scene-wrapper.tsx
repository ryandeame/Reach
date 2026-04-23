import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useDrawerProgress } from '@react-navigation/drawer';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

type DrawerSceneWrapperProps = {
  children: ReactNode;
};

export function DrawerSceneWrapper({ children }: DrawerSceneWrapperProps) {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.86], Extrapolation.CLAMP);
    const translateX = interpolate(progress.value, [0, 1], [0, 170], Extrapolation.CLAMP);
    const rotateY = interpolate(progress.value, [0, 1], [0, -16], Extrapolation.CLAMP);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 28], Extrapolation.CLAMP);

    return {
      borderRadius,
      transform: [
        { perspective: 1200 },
        { translateX },
        { scale },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3EFE7',
    flex: 1,
    overflow: 'hidden',
  },
});

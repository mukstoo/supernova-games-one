import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const TILE = 40;
const SIDEBAR = 120;
const INFOBAR = 90;

const { width: W, height: H } = Dimensions.get('window');
const CONTAINER_W = W - SIDEBAR;
const CONTAINER_H = H - INFOBAR;

export default function MapScreen() {
  const { rows, cols, tiles, pcPos } = useSelector((s: RootState) => s.game);

  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null,
  );
  const [needRecentre, setNeedRecentre] = useState(false);

  /* layout position of visible map viewport (used for tap calc) */
  const viewport = useRef({ x: 0, y: 0 });

  const MAP_W = cols * TILE;
  const MAP_H = rows * TILE;

  const minX = -Math.max(0, MAP_W - CONTAINER_W);
  const maxX = 0;
  const minY = -Math.max(0, MAP_H - CONTAINER_H);
  const maxY = 0;

  const initX = Math.min(
    Math.max(-pcPos.col * TILE + CONTAINER_W / 2 - TILE / 2, minX),
    maxX,
  );
  const initY = Math.min(
    Math.max(-pcPos.row * TILE + CONTAINER_H / 2 - TILE / 2, minY),
    maxY,
  );

  const offsetX = useSharedValue(initX);
  const offsetY = useSharedValue(initY);

  const jsOffset = useRef({ x: initX, y: initY });

  const updateRecentre = (nx: number, ny: number) => {
    jsOffset.current = { x: nx, y: ny };

    const pcScreenX = pcPos.col * TILE + nx;
    const pcScreenY = pcPos.row * TILE + ny;
    const inView =
      pcScreenX >= 0 &&
      pcScreenX < CONTAINER_W &&
      pcScreenY >= 0 &&
      pcScreenY < CONTAINER_H;
    setNeedRecentre(!inView);
  };

  /* pan gesture */
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          'worklet';
          startX.value = offsetX.value;
          startY.value = offsetY.value;
        })
        .onUpdate(e => {
          'worklet';
          let nx = startX.value + e.translationX;
          let ny = startY.value + e.translationY;
          if (nx < minX) nx = minX;
          if (nx > maxX) nx = maxX;
          if (ny < minY) ny = minY;
          if (ny > maxY) ny = maxY;
          offsetX.value = nx;
          offsetY.value = ny;
          runOnJS(updateRecentre)(nx, ny);
        }),
    [minX, maxX, minY, maxY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  /* viewport layout capture */
  const onViewportLayout = (e: LayoutChangeEvent) => {
    viewport.current = {
      x: e.nativeEvent.layout.x,
      y: e.nativeEvent.layout.y,
    };
  };

  /* tap handler */
  const handleRelease = (e: any) => {
    const pageX = e.nativeEvent.pageX;
    const pageY = e.nativeEvent.pageY;
    const localX = pageX - viewport.current.x;
    const localY = pageY - viewport.current.y;

    const mapX = localX - jsOffset.current.x;
    const mapY = localY - jsOffset.current.y;

    const col = Math.floor(mapX / TILE);
    const row = Math.floor(mapY / TILE);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      setSelected({ row, col });
    }
  };

  /* recenter button */
  const recenter = () => {
    offsetX.value = initX;
    offsetY.value = initY;
    updateRecentre(initX, initY);
  };

  const selectedKey = selected ? `${selected.row}-${selected.col}` : null;

  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <Pressable style={styles.btn}>
          <Text style={styles.btnTxt}>Character</Text>
        </Pressable>
        <Pressable style={styles.btn}>
          <Text style={styles.btnTxt}>Options</Text>
        </Pressable>
      </View>

      <View
        style={styles.mapWrap}
        onLayout={onViewportLayout} /* capture container pos */
      >
        <GestureDetector gesture={pan}>
          <Animated.View
            style={animatedStyle}
            onStartShouldSetResponder={() => true}
            onResponderRelease={handleRelease}>
            <Svg width={MAP_W} height={MAP_H}>
              {tiles.map(t => (
                <Rect
                  key={t.id}
                  x={t.col * TILE}
                  y={t.row * TILE}
                  width={TILE}
                  height={TILE}
                  fill={
                    t.terrain === 'plains'
                      ? '#4b4'
                      : t.terrain === 'forest'
                      ? '#264'
                      : '#886'
                  }
                  stroke={
                    selectedKey === t.id ? colors.accentGold : colors.surface
                  }
                  strokeWidth={selectedKey === t.id ? 3 : 0.5}
                  opacity={selectedKey === t.id ? 0.55 : 1}
                />
              ))}
              <SvgText
                x={pcPos.col * TILE + TILE / 2}
                y={pcPos.row * TILE + TILE * 0.7}
                fill={colors.ivoryWhite}
                fontSize="16"
                fontWeight="700"
                textAnchor="middle">
                PC
              </SvgText>
            </Svg>
          </Animated.View>
        </GestureDetector>

        {needRecentre && (
          <Pressable style={styles.recenterBtn} onPress={recenter}>
            <Text style={styles.recenterTxt}>Center PC</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infobar}>
        {selected ? (
          <Text style={styles.infoTxt}>
            Row {selected.row} • Col {selected.col}
          </Text>
        ) : (
          <Text style={styles.infoTxt}>Tap a tile</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: 'row', backgroundColor: colors.backgroundBase },
  sidebar: {
    width: SIDEBAR,
    backgroundColor: colors.surface,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 24,
  },
  btn: {
    width: '90%',
    backgroundColor: colors.accentGold,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnTxt: { color: colors.backgroundBase, fontWeight: '700' },
  mapWrap: {
    width: CONTAINER_W,
    height: CONTAINER_H,
    overflow: 'hidden',
    backgroundColor: colors.backgroundBase,
  },
  recenterBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: colors.accentGold,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  recenterTxt: { color: colors.backgroundBase, fontWeight: '700' },
  infobar: {
    position: 'absolute',
    bottom: 0,
    left: SIDEBAR,
    width: CONTAINER_W,
    height: INFOBAR,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  infoTxt: { color: colors.ivoryWhite },
});

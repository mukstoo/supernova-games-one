import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPcPos, setSelected, Coor } from '../store/slices/gameSlice';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const TILE = 40;
const SIDEBAR = 120;
const INFOBAR = 90;

const { width: W, height: H } = Dimensions.get('window');
const CONTAINER_W = W - SIDEBAR;
const CONTAINER_H = H - INFOBAR;

/* Bresenham */
function makePath(a: Coor, b: Coor) {
  const path: Coor[] = [];
  let [x0, y0] = [a.col, a.row];
  const [x1, y1] = [b.col, b.row];
  const dx = Math.abs(x1 - x0),
    dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1,
    sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    path.push({ col: x0, row: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return path;
}

export default function MapScreen() {
  const dispatch = useDispatch();
  const { rows, cols, tiles, pcPos, selected } = useSelector(
    (s: RootState) => s.game,
  );

  /* ---------- path & distance ---------- */
  const [path, setPath] = useState<Coor[]>([]);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!selected || (selected.row === pcPos.row && selected.col === pcPos.col)) {
      setPath([]);
      setDistance(0);
      return;
    }
    const p = makePath(pcPos, selected);
    setPath(p);
    setDistance(p.length - 1);
  }, [selected, pcPos]);

  /* ---------- camera ---------- */
  const MAP_W = cols * TILE,
    MAP_H = rows * TILE;

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
  const [needCenter, setNeedCenter] = useState(false);

  /* corrected off-screen calc */
  const pcOffscreen = (nx: number, ny: number) => {
    const left = -nx;
    const top = -ny;
    const right = left + CONTAINER_W;
    const bottom = top + CONTAINER_H;

    const pcLeft = pcPos.col * TILE;
    const pcTop = pcPos.row * TILE;
    const pcRight = pcLeft + TILE;
    const pcBottom = pcTop + TILE;

    const off =
      pcLeft < left ||
      pcRight > right ||
      pcTop < top ||
      pcBottom > bottom;

    /* DEBUG */
    console.log(
      '⛳ bounds',
      { left, right, top, bottom },
      'pc',
      { pcLeft, pcRight, pcTop, pcBottom },
      'off',
      off,
    );

    return off;
  };

  const syncOffset = (nx: number, ny: number) => {
    jsOffset.current = { x: nx, y: ny };
    setNeedCenter(pcOffscreen(nx, ny));
  };

  useEffect(() => syncOffset(jsOffset.current.x, jsOffset.current.y), [pcPos]);

  const startX = useSharedValue(0),
    startY = useSharedValue(0);

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
          let nx = startX.value + e.translationX,
            ny = startY.value + e.translationY;
          if (nx < minX) nx = minX;
          if (nx > maxX) nx = maxX;
          if (ny < minY) ny = minY;
          if (ny > maxY) ny = maxY;
          offsetX.value = nx;
          offsetY.value = ny;
          runOnJS(syncOffset)(nx, ny);
        }),
    [minX, maxX, minY, maxY],
  );

  const camStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  const centerCam = () => {
    offsetX.value = withTiming(initX);
    offsetY.value = withTiming(initY);
    syncOffset(initX, initY);
  };

  /* ---------- selection ---------- */
  const viewport = useRef({ x: 0, y: 0 });
  const onLayout = (e: LayoutChangeEvent) =>
    (viewport.current = {
      x: e.nativeEvent.layout.x,
      y: e.nativeEvent.layout.y,
    });

  const tapSelect = (e: any) => {
    const col = Math.floor(
      (e.nativeEvent.pageX - viewport.current.x - jsOffset.current.x) / TILE,
    );
    const row = Math.floor(
      (e.nativeEvent.pageY - viewport.current.y - jsOffset.current.y) / TILE,
    );
    if (col >= 0 && col < cols && row >= 0 && row < rows)
      dispatch(setSelected({ col, row }));
  };

  /* ---------- travel / encounter ---------- */
  const travelRef = useRef({ idx: 1, active: false, paused: false });
  const [encounter, setEncounter] = useState(false);

  const travelStep = useCallback(() => {
    const r = travelRef.current;
    if (!r.active || r.paused || r.idx >= path.length) {
      r.active = false;
      return;
    }
    const next = path[r.idx];
    dispatch(setPcPos(next));
    r.idx += 1;

    if (Math.random() < 0.1) {
      r.paused = true;
      setEncounter(true);
      return;
    }
    setTimeout(travelStep, 120);
  }, [path, dispatch]);

  const startTravel = () => {
    if (!path.length || travelRef.current.active) return;
    travelRef.current = { idx: 1, active: true, paused: false };
    travelStep();
  };

  const resumeTravel = () => {
    setEncounter(false);
    travelRef.current.paused = false;
    setTimeout(travelStep, 120);
  };

  /* options overlay */
  const [showOpts, setShowOpts] = useState(false);

  /* ---------- render ---------- */
  const selectedKey = selected ? `${selected.row}-${selected.col}` : null;
  const onPc = selected && selected.col === pcPos.col && selected.row === pcPos.row;

  return (
    <View style={styles.container}>
      {/* sidebar */}
      <View style={styles.sidebar}>
        <Pressable style={styles.btn}>
          <Text style={styles.btnTxt}>Character</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => setShowOpts(true)}>
          <Text style={styles.btnTxt}>Options</Text>
        </Pressable>
      </View>

      {/* map */}
      <View style={styles.mapWrap} onLayout={onLayout}>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={camStyle}
            onStartShouldSetResponder={() => true}
            onResponderRelease={tapSelect}>
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
                  stroke={selectedKey === t.id ? colors.accentGold : colors.surface}
                  strokeWidth={selectedKey === t.id ? 3 : 0.5}
                  opacity={selectedKey === t.id ? 0.55 : 1}
                />
              ))}
              {selected && path.length > 1 && (
                <Line
                  x1={pcPos.col * TILE + TILE / 2}
                  y1={pcPos.row * TILE + TILE / 2}
                  x2={selected.col * TILE + TILE / 2}
                  y2={selected.row * TILE + TILE / 2}
                  stroke={colors.accentGold}
                  strokeWidth={2}
                />
              )}
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

        {needCenter && (
          <Pressable style={styles.centerBtn} onPress={centerCam}>
            <Text style={styles.centerTxt}>Center PC</Text>
          </Pressable>
        )}
      </View>

      {/* info bar */}
      <View style={styles.infobar}>
        {encounter ? (
          <Pressable style={styles.actionBtn} onPress={resumeTravel}>
            <Text style={styles.actionTxt}>Encounter! Continue</Text>
          </Pressable>
        ) : selected ? (
          <>
            <Text style={styles.infoTxt}>
              Row {selected.row} • Col {selected.col} • Dist {distance}
            </Text>
            {!onPc && (
              <Pressable style={styles.actionBtn} onPress={startTravel}>
                <Text style={styles.actionTxt}>Travel</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.infoTxt}>Tap a tile</Text>
        )}
      </View>

      {/* options modal */}
      {showOpts && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popTitle}>Options</Text>
            <Pressable style={styles.popBtn} onPress={() => setShowOpts(false)}>
              <Text style={styles.popBtnTxt}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* encounter modal */}
      {encounter && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popTitle}>Encounter!</Text>
            <Pressable style={styles.popBtn} onPress={resumeTravel}>
              <Text style={styles.popBtnTxt}>Continue</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 40 },

  sidebar: { width: SIDEBAR, backgroundColor: colors.surface, paddingVertical: 20, alignItems: 'center', gap: 24 },
  btn: { width: '90%', backgroundColor: colors.accentGold, paddingVertical: 10, alignItems: 'center' },
  btnTxt: { color: colors.backgroundBase, fontWeight: '700' },

  mapWrap: { width: CONTAINER_W, height: CONTAINER_H, overflow: 'hidden' }, // fixed width/height
  centerBtn: { position: 'absolute', right: 10, top: 10, backgroundColor: colors.accentGold, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  centerTxt: { color: colors.backgroundBase, fontWeight: '700' },

  infobar: { position: 'absolute', bottom: 0, left: SIDEBAR, right: 0, height: INFOBAR, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', gap: 8 },
  infoTxt: { color: colors.ivoryWhite },
  actionBtn: { backgroundColor: colors.accentGold, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 4 },
  actionTxt: { color: colors.backgroundBase, fontWeight: '700' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popup: { width: 240, backgroundColor: colors.surface, padding: 24, alignItems: 'center', gap: 18 },
  popTitle: { color: colors.ivoryWhite, fontSize: 20, fontWeight: '700' },
  popBtn: { backgroundColor: colors.accentGold, paddingVertical: 8, paddingHorizontal: 22, borderRadius: 4 },
  popBtnTxt: { color: colors.backgroundBase, fontWeight: '700' },
});

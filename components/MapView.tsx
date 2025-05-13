// components/MapView.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Pressable,
  Text,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Tile, TerrainType, Coor } from '../utils/mapGen';
import { colors } from '../theme/colors';

const TILE = 40;

// Helper to clamp values within a range
function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// Helper to generate path coordinates (Bresenham)
function makePath(a: Coor, b: Coor): Coor[] {
  const path: Coor[] = [];
  let x0 = a.col, y0 = a.row;
  const x1 = b.col, y1 = b.row;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    path.push({ col: x0, row: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return path;
}

// Helper function to get color based on terrain type
function getTileColor(type: TerrainType): string {
  switch (type) {
    case 'plains':      return colors.lightGreen;
    case 'forest':      return colors.forestGreen;
    case 'mountains':   return colors.ivoryWhite;
    case 'desert':      return colors.desertTan;
    case 'settlement':  return colors.sandyBrown;
    default:            return colors.fadedBeige;
  }
}

export interface MapViewProps {
  rows: number;
  cols: number;
  tiles: Tile[];
  pcPos: Coor;
  selected: Coor | null;
  onSelect: (coord: Coor) => void;
  activeQuestLocations?: Coor[];
}

export interface MapViewRef {
  centerOnCoords: (coords: Coor) => void;
}

const MapView = forwardRef<MapViewRef, MapViewProps>((
  {
    rows, cols, tiles, pcPos, selected, onSelect, activeQuestLocations = [],
  },
  ref
) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState<Coor[]>([]);

  const viewBoxRef = useRef(viewBox);
  useEffect(() => { viewBoxRef.current = viewBox; }, [viewBox]);

  useEffect(() => {
    if (!selected || (selected.row === pcPos.row && selected.col === pcPos.col)) {
      setPath([]);
    } else {
      const p = makePath(pcPos, selected);
      setPath(p);
    }
  }, [pcPos, selected]);

  const mapW = cols * TILE;
  const mapH = rows * TILE;

  // Function to center the viewbox on specific coordinates
  const centerOnCoordsInternal = (coords: Coor) => {
    if (size.width <= 0 || size.height <= 0) return;
    const maxX = Math.max(0, mapW - size.width);
    const maxY = Math.max(0, mapH - size.height);
    const cx = clamp(coords.col * TILE - size.width / 2 + TILE / 2, 0, maxX);
    const cy = clamp(coords.row * TILE - size.height / 2 + TILE / 2, 0, maxY);
    viewBoxRef.current = { x: cx, y: cy };
    setViewBox({ x: cx, y: cy });
  };

  // Expose centerOnCoords via ref
  useImperativeHandle(ref, () => ({
    centerOnCoords: centerOnCoordsInternal,
  }));

  // Function to center on the Player Character
  const centerPC = () => {
    centerOnCoordsInternal(pcPos);
  };

  // Center on PC once layout size is known and when PC position changes
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      centerPC();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pcPos.row, pcPos.col, size.width, size.height]); // centerPC dependency not needed

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // Only update size if it actually changed to prevent potential loops
    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
      // Initial centering happens in useEffect now
    }
  };

  const panResponder = useMemo(() => {
    let startX = 0, startY = 0;
    let isTap = true;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX = viewBoxRef.current.x;
        startY = viewBoxRef.current.y;
        isTap = true;
      },
      onPanResponderMove: (_e, gs) => {
        // If movement exceeds threshold, it's not a tap
        if (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5) {
          isTap = false;
        }
        const maxX = Math.max(0, mapW - size.width);
        const maxY = Math.max(0, mapH - size.height);
        const nx = clamp(startX - gs.dx, 0, maxX);
        const ny = clamp(startY - gs.dy, 0, maxY);
        viewBoxRef.current = { x: nx, y: ny };
        setViewBox({ x: nx, y: ny });
      },
      onPanResponderRelease: (evt, gs) => {
        // If it was a tap (minimal movement)
        if (isTap) {
          const { locationX, locationY } = evt.nativeEvent;
          const col = Math.floor((viewBoxRef.current.x + locationX) / TILE);
          const row = Math.floor((viewBoxRef.current.y + locationY) / TILE);
          if (col >= 0 && col < cols && row >= 0 && row < rows) {
            onSelect({ row, col });
          }
        }
      },
    });
  }, [size.width, size.height, mapW, mapH, cols, rows, onSelect]);

  const needCenter = useMemo(() => {
      if (!size.width || !size.height) return false;
      const pcScreenX = pcPos.col * TILE - viewBox.x;
      const pcScreenY = pcPos.row * TILE - viewBox.y;
      return (
          pcScreenX < 0 ||
          pcScreenX + TILE > size.width ||
          pcScreenY < 0 ||
          pcScreenY + TILE > size.height
      );
  }, [pcPos, viewBox, size, TILE]);

  const questLocationSet = useMemo(() => {
    const set = new Set<string>();
    activeQuestLocations.forEach(loc => set.add(`${loc.row}-${loc.col}`));
    return set;
  }, [activeQuestLocations]);

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      {size.width > 0 && size.height > 0 && (
        <Svg
          width={size.width}
          height={size.height}
          viewBox={`${viewBox.x} ${viewBox.y} ${size.width} ${size.height}`}
        >
          {tiles.map(t => {
            const isSelected = selected?.row === t.row && selected?.col === t.col;
            const isPcLocation = pcPos.row === t.row && pcPos.col === t.col;
            const isQuestLocation = questLocationSet.has(`${t.row}-${t.col}`);

            return (
              // Use React.Fragment to avoid unnecessary nesting if key needed on Rect
              <React.Fragment key={`${t.row}-${t.col}`}>
                <Rect
                  x={t.col * TILE}
                  y={t.row * TILE}
                  width={TILE}
                  height={TILE}
                  fill={getTileColor(t.type)}
                  stroke={isSelected ? colors.accentGold : colors.steelGrey} // Darker stroke for non-selected
                  strokeWidth={isSelected ? 2 : 0.5}
                  // onPress handled by PanResponder release for taps
                />
                {isPcLocation && (
                  <SvgText
                    x={t.col * TILE + TILE / 2}
                    y={t.row * TILE + TILE / 2}
                    fill={colors.obsidianBlack}
                    fontSize={TILE * 0.6}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    PC
                  </SvgText>
                )}
                {isQuestLocation && !isPcLocation && (
                  <SvgText
                    x={t.col * TILE + TILE / 2}
                    y={t.row * TILE + TILE / 2}
                    fill={colors.ivoryWhite}
                    stroke={colors.obsidianBlack}
                    strokeWidth={0.5}
                    fontSize={TILE * 0.5}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    Q
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
          {path.length > 1 && selected && (
            <Line
              x1={pcPos.col * TILE + TILE / 2}
              y1={pcPos.row * TILE + TILE / 2}
              x2={selected.col * TILE + TILE / 2}
              y2={selected.row * TILE + TILE / 2}
              stroke={colors.accentGold}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
        </Svg>
      )}
      {needCenter && (
        <Pressable style={styles.centerBtn} onPress={centerPC}>
          <Text style={styles.centerTxt}>Center PC</Text>
        </Pressable>
      )}
    </View>
  );
});

export default MapView;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  centerBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.accentGold,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    opacity: 0.9, // Slightly transparent
    zIndex: 10, // Ensure button is on top
  },
  centerTxt: { color: colors.backgroundBase, fontWeight: 'bold' }, // Bolder text
});

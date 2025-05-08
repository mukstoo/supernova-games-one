// components/MapView.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { Coor } from '../store/slices/gameSlice';
import { Tile } from '../utils/mapGen';
import { colors } from '../theme/colors';

const TILE = 40;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

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

export interface MapViewProps {
  rows: number;
  cols: number;
  tiles: Tile[];
  pcPos: Coor;
  selected: Coor | null;
  onSelect: (coord: Coor) => void;
}

export default function MapView({
  rows, cols, tiles, pcPos, selected, onSelect,
}: MapViewProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState<Coor[]>([]);

  // keep a ref so pan callbacks always see latest viewBox
  const viewBoxRef = useRef(viewBox);
  useEffect(() => { viewBoxRef.current = viewBox }, [viewBox]);

  // recompute the straight‐line path
  useEffect(() => {
    console.log('[MapView] computePath:', pcPos, '→', selected);
    if (!selected || (selected.row === pcPos.row && selected.col === pcPos.col)) {
      setPath([]);
    } else {
      const p = makePath(pcPos, selected);
      console.log('[MapView] new path length', p.length);
      setPath(p);
    }
  }, [pcPos, selected]);

  const mapW = cols * TILE;
  const mapH = rows * TILE;

  // center on PC once we know container size
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    console.log('[MapView] onLayout', width, height);
    setSize({ width, height });

    const maxX = Math.max(0, mapW - width);
    const maxY = Math.max(0, mapH - height);
    const initX = clamp(pcPos.col * TILE - width / 2 + TILE / 2, 0, maxX);
    const initY = clamp(pcPos.row * TILE - height / 2 + TILE / 2, 0, maxY);
    console.log('[MapView] init viewBox', initX, initY);
    setViewBox({ x: initX, y: initY });
  };

  // rebuild PanResponder whenever size changes
  const panResponder = useMemo(() => {
    console.log('[MapView] creating PanResponder with size', size);
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('[MapView] pan start at', viewBoxRef.current);
      },
      onPanResponderMove: (_e, gs) => {
        const maxX = Math.max(0, mapW - size.width);
        const maxY = Math.max(0, mapH - size.height);
        const nx = clamp(viewBoxRef.current.x - gs.dx, 0, maxX);
        const ny = clamp(viewBoxRef.current.y - gs.dy, 0, maxY);
        console.log('[MapView] pan move →', nx, ny, 'bounds x:[0,',maxX,'] y:[0,',maxY,']');
        viewBoxRef.current = { x: nx, y: ny };
        setViewBox({ x: nx, y: ny });
      },
      onPanResponderRelease: (evt, gs) => {
        console.log('[MapView] pan end at', viewBoxRef.current);
        // small move → treat as tap
        if (Math.abs(gs.dx) < 5 && Math.abs(gs.dy) < 5) {
          const { locationX, locationY } = evt.nativeEvent;
          const col = Math.floor((viewBoxRef.current.x + locationX) / TILE);
          const row = Math.floor((viewBoxRef.current.y + locationY) / TILE);
          console.log('[MapView] tap at cell', row, col);
          if (col >= 0 && col < cols && row >= 0 && row < rows) {
            onSelect({ row, col });
          }
        }
      },
    });
  }, [size.width, size.height, mapW, mapH, cols, rows, onSelect]);

  // “center PC” button if PC is offscreen
  const needCenter =
    pcPos.col * TILE < viewBox.x ||
    pcPos.col * TILE + TILE > viewBox.x + size.width ||
    pcPos.row * TILE < viewBox.y ||
    pcPos.row * TILE + TILE > viewBox.y + size.height;

  const centerPC = () => {
    const maxX = Math.max(0, mapW - size.width);
    const maxY = Math.max(0, mapH - size.height);
    const cx = clamp(pcPos.col * TILE - size.width / 2 + TILE / 2, 0, maxX);
    const cy = clamp(pcPos.row * TILE - size.height / 2 + TILE / 2, 0, maxY);
    console.log('[MapView] centerPC →', cx, cy);
    viewBoxRef.current = { x: cx, y: cy };
    setViewBox({ x: cx, y: cy });
  };

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      {size.width > 0 && size.height > 0 && (
        <Svg
          width={size.width}
          height={size.height}
          viewBox={`${viewBox.x} ${viewBox.y} ${size.width} ${size.height}`}
        >
          {tiles.map(t => (
            <Rect
              key={`${t.row}-${t.col}`}
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
                selected?.row === t.row && selected?.col === t.col
                  ? colors.accentGold
                  : colors.surface
              }
              strokeWidth={
                selected?.row === t.row && selected?.col === t.col ? 3 : 0.5
              }
              opacity={
                selected?.row === t.row && selected?.col === t.col ? 0.55 : 1
              }
            />
          ))}
          {path.length > 1 && selected && (
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
            textAnchor="middle"
          >
            PC
          </SvgText>
        </Svg>
      )}
      {needCenter && (
        <Pressable style={styles.centerBtn} onPress={centerPC}>
          <Text style={styles.centerTxt}>Center PC</Text>
        </Pressable>
      )}
    </View>
  );
}

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
  },
  centerTxt: { color: colors.backgroundBase, fontWeight: '700' },
});

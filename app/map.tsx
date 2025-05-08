// screens/MapScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import MapView from '../components/MapView';
import { RootState } from '../store';
import {
  setSelected,
  setPcPos,
  Coor,
} from '../store/slices/gameSlice';
import { colors } from '../theme/colors';

export default function MapScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { rows, cols, tiles, pcPos, selected } = useSelector(
    (s: RootState) => s.game
  );
  const attributePoints = useSelector(
    (s: RootState) => s.player.attributePoints
  );
  const [encounter, setEncounter] = useState(false);

  const handleSelect = useCallback(
    (coord: Coor) => dispatch(setSelected(coord)),
    [dispatch]
  );

  const startTravel = () => {
    if (
      !selected ||
      (selected.row === pcPos.row && selected.col === pcPos.col)
    )
      return;
    // Bresenham path…
    const path: Coor[] = [];
    let x0 = pcPos.col,
      y0 = pcPos.row;
    const x1 = selected.col,
      y1 = selected.row;
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
    let idx = 1;
    const step = () => {
      if (idx >= path.length) return;
      dispatch(setPcPos(path[idx]));
      idx++;
      if (Math.random() < 0.1) {
        setEncounter(true);
      } else {
        setTimeout(step, 120);
      }
    };
    step();
  };

  const onEnter = () => {
    const tile = tiles.find(
      (t) => t.row === pcPos.row && t.col === pcPos.col
    );
    if (tile) {
      router.push({
        pathname: '/location/[type]',
        params: { type: tile.locationType },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.main}>
        <View style={styles.sidebar}>
          <View style={styles.btnContainer}>
            <Pressable
              style={styles.btn}
              onPress={() => router.push('/character-sheet')}
            >
              <Text style={styles.btnTxt}>Character</Text>
            </Pressable>
            {attributePoints > 0 && <View style={styles.badge} />}
          </View>
          <View style={styles.btnContainer}>
            <Pressable style={styles.btn} onPress={() => {}}>
              <Text style={styles.btnTxt}>Options</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            rows={rows}
            cols={cols}
            tiles={tiles}
            pcPos={pcPos}
            selected={selected}
            onSelect={handleSelect}
          />
        </View>
      </View>
      <View style={styles.infobar}>
        {encounter ? (
          <Pressable
            style={styles.actionBtn}
            onPress={() => setEncounter(false)}
          >
            <Text style={styles.actionTxt}>Continue</Text>
          </Pressable>
        ) : selected ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoTxt}>
              Row {selected.row} • Col {selected.col}
            </Text>
            {selected.row === pcPos.row &&
            selected.col === pcPos.col ? (
              <Pressable style={styles.actionBtn} onPress={onEnter}>
                <Text style={styles.actionTxt}>Enter</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.actionBtn} onPress={startTravel}>
                <Text style={styles.actionTxt}>Travel</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Text style={styles.infoTxt}>Tap a tile</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    paddingVertical: 20,
    marginRight: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  btnContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    backgroundColor: colors.accentGold,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnTxt: {
    color: colors.backgroundBase,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bloodRed,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  infobar: {
    height: 90,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.accentGold,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTxt: {
    color: colors.ivoryWhite,
    marginRight: 12,
  },
  actionBtn: {
    backgroundColor: colors.accentGold,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  actionTxt: {
    color: colors.backgroundBase,
    fontWeight: '700',
  },
});

// screens/MapScreen.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import MapView from '../components/MapView';
import { RootState } from '../store';
import {
  setSelected,
  setPcPos,
  advanceTime,
} from '../store/slices/gameSlice';
import { Coor, TerrainType, Tile } from '../utils/mapGen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { allQuests } from '../utils/quests';
import { Quest } from '../utils/questTypes';
import { QuestStatusInfo } from '../store/slices/playerSlice';

export default function MapScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { rows, cols, tiles, pcPos, selected, ticks } = useSelector(
    (s: RootState) => s.game
  );
  const { attributePoints, quests: playerQuests } = useSelector(
    (s: RootState) => s.player
  );
  const [encounter, setEncounter] = useState(false);
  const [isQuestModalVisible, setIsQuestModalVisible] = useState(false);

  const activeQuestsWithInfo = useMemo(() => {
    return allQuests
      .filter(q => playerQuests[q.id]?.status === 'active')
      .map(q => ({
        ...q,
        statusInfo: playerQuests[q.id]
      }))
      .filter(q => q.statusInfo);
  }, [playerQuests]);

  const activeQuestLocations = useMemo(() => {
    return activeQuestsWithInfo
      .map(q => q.statusInfo.location)
      .filter((loc): loc is Coor => !!loc);
  }, [activeQuestsWithInfo]);

  const activeQuestMap = useMemo(() => {
    const map = new Map<string, Quest & { statusInfo: QuestStatusInfo }>();
    activeQuestsWithInfo.forEach(q => {
      if (q.statusInfo.location) {
        map.set(`${q.statusInfo.location.row}-${q.statusInfo.location.col}`, q);
      }
    });
    return map;
  }, [activeQuestsWithInfo]);

  const mapViewRef = useRef<{ centerOnCoords: (coords: Coor) => void }>(null);

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
      dispatch(advanceTime());
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
    if (tile && tile.type === 'settlement') {
      router.push({
        pathname: '/location/[type]',
        params: { type: tile.type, row: pcPos.row, col: pcPos.col },
      });
    }
  };

  const selectedQuest = selected ? activeQuestMap.get(`${selected.row}-${selected.col}`) : null;
  const selectedTile = selected && !selectedQuest
    ? tiles.find((t) => t.row === selected.row && t.col === selected.col)
    : null;

  const handleQuestClick = (quest: Quest & { statusInfo: QuestStatusInfo }) => {
    if (quest.statusInfo.location) {
      mapViewRef.current?.centerOnCoords(quest.statusInfo.location);
      dispatch(setSelected(quest.statusInfo.location));
    }
    setIsQuestModalVisible(false);
  };

  const onEnterQuestLocation = () => {
    if (selectedQuest) {
        router.push({
            pathname: '/quest-entry/[questId]' as any,
            params: { questId: selectedQuest.id },
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
            <Pressable style={styles.btn} onPress={() => setIsQuestModalVisible(true)}>
              <Text style={styles.btnTxt}>Quests</Text>
            </Pressable>
          </View>
          <View style={styles.btnContainer}>
            <Pressable style={styles.btn} onPress={() => router.push('/options')}>
              <Text style={styles.btnTxt}>Options</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapViewRef}
            rows={rows}
            cols={cols}
            tiles={tiles}
            pcPos={pcPos}
            selected={selected}
            onSelect={handleSelect}
            activeQuestLocations={activeQuestLocations}
          />
        </View>
      </View>
      <View style={styles.infobar}>
        <Text style={styles.timeText}>Time: {ticks}</Text>
        <View style={styles.infoActions}>
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
                {selectedQuest 
                  ? `Quest: ${selectedQuest.title}` 
                  : selectedTile 
                  ? `${selectedTile.type.charAt(0).toUpperCase() + selectedTile.type.slice(1)}` 
                  : 'Selected'} ({selected.row}, {selected.col})
              </Text>
              {!(selected.row === pcPos.row && selected.col === pcPos.col) && (
                <Pressable style={styles.actionBtn} onPress={startTravel}>
                  <Text style={styles.actionTxt}>Travel</Text>
                </Pressable>
              )}
              {selected.row === pcPos.row &&
               selected.col === pcPos.col &&
               selectedTile?.type === 'settlement' && (
                <Pressable style={styles.actionBtn} onPress={onEnter}>
                  <Text style={styles.actionTxt}>Enter Settlement</Text>
                </Pressable>
              )}
              {selected.row === pcPos.row &&
               selected.col === pcPos.col &&
               selectedQuest && (
                <Pressable style={styles.actionBtn} onPress={onEnterQuestLocation}>
                  <Text style={styles.actionTxt}>Enter Quest</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.infoActionsRow}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => setIsQuestModalVisible(true)}
              >
                <Text style={styles.actionTxt}>Quests ({activeQuestsWithInfo.length})</Text>
              </Pressable>
              <Pressable
                 style={styles.actionBtn}
                 onPress={() => mapViewRef.current?.centerOnCoords(pcPos)}
               >
                 <Text style={styles.actionTxt}>Center PC</Text>
               </Pressable>
            </View>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isQuestModalVisible}
        onRequestClose={() => {
          setIsQuestModalVisible(!isQuestModalVisible);
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Active Quests</Text>
            <ScrollView style={styles.modalScrollView}>
              {activeQuestsWithInfo.length === 0 ? (
                <Text style={styles.modalText}>No active quests.</Text>
              ) : (
                activeQuestsWithInfo.map((quest) => (
                  <TouchableOpacity
                    key={quest.id}
                    style={styles.questItem}
                    onPress={() => handleQuestClick(quest)}
                  >
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    {quest.statusInfo.location && (
                       <Text style={styles.questLocationText}>
                         Location: ({quest.statusInfo.location.row}, {quest.statusInfo.location.col})
                       </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <Pressable
              style={[styles.modalButton, styles.modalButtonClose]}
              onPress={() => setIsQuestModalVisible(!isQuestModalVisible)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.accentGold,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  timeText: {
    color: colors.accentGold,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 80,
  },
  infoActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
  },
  infoTxt: {
    color: colors.ivoryWhite,
    textAlign: 'right',
  },
  actionBtn: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  actionBtnDisabled: {
    backgroundColor: colors.steelGrey, 
    opacity: 0.6,
  },
  actionTxt: {
    color: colors.obsidianBlack,
    fontWeight: 'bold',
    fontSize: 14,
  },
  questBtn: {
    backgroundColor: colors.bloodRed,
    borderColor: colors.obsidianBlack,
  },
  questBtnTxt: {
    color: colors.ivoryWhite,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: spacing.md,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.obsidianBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentGold,
    marginBottom: spacing.lg,
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
    marginBottom: spacing.md,
  },
  questItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
    width: '100%',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.ivoryWhite,
  },
  questLocationText: {
    fontSize: 12,
    color: colors.fadedBeige,
    marginTop: spacing.xs,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    elevation: 2,
    marginTop: spacing.sm,
  },
  modalButtonClose: {
    backgroundColor: colors.accentGold,
    borderWidth: 1,
    borderColor: colors.obsidianBlack,
  },
  modalButtonText: {
    color: colors.obsidianBlack,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.steelGrey,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  infoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

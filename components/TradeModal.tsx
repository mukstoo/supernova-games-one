import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  selectPlayerGold, 
  selectPlayerInventory, 
  playerBuysItem, 
  playerSellsItem, 
  selectPlayerEquipped
} from '../store/slices/playerSlice';
import { 
  selectMerchantInventory, 
  refreshMerchantInventory, 
  playerBoughtItem as merchantReceivesPurchase, 
  playerSoldItem as merchantReceivesSale 
} from '../store/slices/merchantSlice';
import type { MerchantItem } from '../store/slices/merchantSlice';
import type { Item } from '../utils/items';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TradeModalProps {
  visible: boolean;
  onClose: () => void;
  locationId: string; // To potentially tie merchant inventory to a specific location later
}

export function TradeModal({ visible, onClose, locationId }: TradeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const playerGold = useSelector(selectPlayerGold);
  const rawPlayerInventory = useSelector(selectPlayerInventory);
  const playerEquipped = useSelector(selectPlayerEquipped);
  const merchantInventory = useSelector(selectMerchantInventory);
  const currentTick = useSelector((state: RootState) => state.game.ticks);

  const { height: screenHeight } = useWindowDimensions();

  const [selectedPlayerItem, setSelectedPlayerItem] = useState<Item | null>(null);
  const [selectedMerchantItem, setSelectedMerchantItem] = useState<MerchantItem | null>(null);

  const sellablePlayerInventory = useMemo(() => {
    const equippedWeaponId = playerEquipped.weapon?.id;
    const equippedArmorId = playerEquipped.armor?.id;
    return rawPlayerInventory.filter(item => 
      item.id !== equippedWeaponId && item.id !== equippedArmorId
    );
  }, [rawPlayerInventory, playerEquipped]);

  useEffect(() => {
    if (visible) {
      dispatch(refreshMerchantInventory({ currentTick, forceRefresh: merchantInventory.length === 0 }));
      setSelectedPlayerItem(null);
      setSelectedMerchantItem(null);
    }
  }, [visible, dispatch, currentTick, merchantInventory.length]);

  const handleSelectItemForSale = (item: Item) => {
    setSelectedPlayerItem(item);
    setSelectedMerchantItem(null);
  };

  const handleSelectItemToBuy = (item: MerchantItem) => {
    setSelectedMerchantItem(item);
    setSelectedPlayerItem(null);
  };

  const handleSellItem = () => {
    if (!selectedPlayerItem) return;
    dispatch(playerSellsItem({ item: selectedPlayerItem, goldAmount: selectedPlayerItem.value }));
    dispatch(merchantReceivesSale({ item: selectedPlayerItem, currentTick }));
    setSelectedPlayerItem(null);
  };

  const handleBuyItem = () => {
    if (!selectedMerchantItem || playerGold < selectedMerchantItem.value) return;
    dispatch(playerBuysItem({ item: selectedMerchantItem, goldAmount: selectedMerchantItem.value }));
    dispatch(merchantReceivesPurchase({ itemInstanceId: selectedMerchantItem.instanceId }));
    setSelectedMerchantItem(null);
  };

  const renderItem = (item: Item | MerchantItem, type: 'player' | 'merchant', onPress: () => void, isSelected: boolean) => {
    const merchantItem = type === 'merchant' ? item as MerchantItem : undefined;
    const baseItem = type === 'player' ? item as Item : (item as MerchantItem);

    // Define text style based on selection state
    const itemNameStyle = [
      styles.itemName,
      isSelected && styles.itemNameSelected // Apply selected style if item is selected
    ];

    return (
      <TouchableOpacity 
        key={type === 'merchant' ? merchantItem!.instanceId : baseItem.id} 
        style={[styles.itemRow, isSelected && styles.itemSelected]}
        onPress={onPress}
      >
        <Text style={itemNameStyle}>{baseItem.name} ({baseItem.value}g)</Text>
        {merchantItem && <Text style={styles.itemExpiry}>(Expires: {merchantItem.expiresAtTick})</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: screenHeight * 0.9 }]}>
          <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
            <Text style={styles.modalTitle}>Trade</Text>
            <Text style={styles.goldDisplay}>Player Gold: {playerGold}g</Text>

            <View style={styles.inventoryContainer}>
              {/* Player Inventory - Sell */} 
              <View style={styles.inventorySection}>
                <Text style={styles.sectionTitle}>Your Items (Sell)</Text>
                <ScrollView style={styles.scrollableList}>
                  {sellablePlayerInventory.length === 0 && <Text style={styles.emptyText}>Nothing to sell.</Text>}
                  {sellablePlayerInventory.map((item) => 
                    renderItem(item, 'player', () => handleSelectItemForSale(item), selectedPlayerItem?.id === item.id)
                  )}
                </ScrollView>
              </View>

              {/* Merchant Inventory - Buy */} 
              <View style={styles.inventorySection}>
                <Text style={styles.sectionTitle}>Merchant Wares (Buy)</Text>
                <ScrollView style={styles.scrollableList}>
                  {merchantInventory.length === 0 && <Text style={styles.emptyText}>Merchant has no items.</Text>}
                  {merchantInventory.map((item) => 
                    renderItem(item, 'merchant', () => handleSelectItemToBuy(item), selectedMerchantItem?.instanceId === item.instanceId)
                  )}
                </ScrollView>
              </View>
            </View>

            {/* Transaction Area */} 
            <View style={styles.transactionArea}>
              {selectedPlayerItem && (
                <View style={styles.selectionDetails}>
                  <Text style={styles.transactionText}>Sell: {selectedPlayerItem.name} for {selectedPlayerItem.value}g</Text>
                  <TouchableOpacity style={styles.actionButton} onPress={handleSellItem}>
                    <Text style={styles.actionButtonText}>Sell Item</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedMerchantItem && (
                <View style={styles.selectionDetails}>
                  <Text style={styles.transactionText}>Buy: {selectedMerchantItem.name} for {selectedMerchantItem.value}g</Text>
                  <TouchableOpacity 
                    style={[styles.actionButton, playerGold < selectedMerchantItem.value && styles.disabledButton]}
                    onPress={handleBuyItem}
                    disabled={playerGold < selectedMerchantItem.value}
                  >
                    <Text style={styles.actionButtonText}>Buy Item</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!selectedPlayerItem && !selectedMerchantItem && (
                  <Text style={styles.emptyTransactionText}>Select an item to trade.</Text>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close Trade</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentGold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  goldDisplay: {
    fontSize: 16,
    color: colors.ivoryWhite,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inventoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    minHeight: 200,
  },
  inventorySection: {
    width: '48%',
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ivoryWhite,
    marginBottom: spacing.sm,
  },
  scrollableList: {
    flexGrow: 1,
    minHeight: 150,
    borderColor: colors.steelGrey,
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.xs,
  },
  itemRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGrey,
    backgroundColor: colors.obsidianBlack, 
    marginBottom: spacing.xs,
    borderRadius: 4,
  },
  itemSelected: {
    backgroundColor: colors.accentGold,
    borderColor: colors.ivoryWhite,
    borderWidth: 1,
    paddingVertical: spacing.sm -1,
    paddingHorizontal: spacing.xs -1,
  },
  itemName: {
    color: colors.ivoryWhite,
    fontSize: 14,
  },
  itemNameSelected: {
    color: colors.obsidianBlack,
    fontWeight: 'bold',
  },
  itemExpiry: {
    color: colors.fadedBeige,
    fontSize: 10,
    fontStyle: 'italic',
  },
  emptyText: {
    color: colors.steelGrey,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: spacing.md,
  },
  transactionArea: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 80, 
  },
  selectionDetails: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionText: {
    color: colors.ivoryWhite,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  emptyTransactionText: {
    color: colors.steelGrey,
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
    marginTop: spacing.xs,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.obsidianBlack,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: colors.steelGrey,
    opacity: 0.7,
  },
  closeButton: {
    backgroundColor: colors.steelGrey,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  closeButtonText: {
    color: colors.ivoryWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TradeModal; 
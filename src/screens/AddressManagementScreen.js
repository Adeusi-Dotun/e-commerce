import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, Pressable, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { AddressContext } from '../context/AddressContext';

const PRIMARY = '#FF6B00';
const BG = '#F8F9FA';
const CARD = '#FFFFFF';
const TEXT = '#0D1321';
const TEXT_MUTED = '#5C4A3D';
const TEXT_LIGHT = '#9A948C';
const BORDER = 'rgba(0, 0, 0, 0.06)';

const AddressManagementScreen = () => {
  const navigation = useNavigation();
  const { addresses, selectedAddress, loading, deleteAddress, selectAddress, setDefaultAddress } = useContext(AddressContext);

  const handleDelete = (id, label, name) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete your "${label} (${name})" address?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteAddress(id) }
      ]
    );
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'Hostel': return 'home';
      case 'Faculty': return 'school';
      case 'Office': return 'briefcase';
      default: return 'location';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Manage Addresses" />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContent}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={48} color="#9C4400" />
            </View>
            
            <Text style={styles.title}>No addresses saved yet</Text>
            <Text style={styles.subtitle}>
              Add an address to start getting deliveries directly to your location on campus.
            </Text>

            <Pressable style={styles.button} onPress={() => navigation.navigate('AddNewAddress')}>
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.buttonText}>Add New Address</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* Address List Screen */
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.listHeading}>YOUR SAVED ADDRESSES</Text>
            
            {addresses.map((item) => {
              const isSelected = selectedAddress && selectedAddress.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.addressCard,
                    isSelected && styles.addressCardSelected
                  ]}
                  onPress={() => selectAddress(item)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.labelBadgeWrap}>
                      <View style={[styles.labelBadge, isSelected && styles.labelBadgeActive]}>
                        <Ionicons
                          name={getLabelIcon(item.label)}
                          size={13}
                          color={isSelected ? 'white' : PRIMARY}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.labelText, isSelected && styles.labelTextActive]}>
                          {item.label}
                        </Text>
                      </View>

                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.actionButtons}>
                      {!item.isDefault && (
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => setDefaultAddress(item.id)}
                          hitSlop={8}
                        >
                          <Ionicons name="star-outline" size={18} color={TEXT_LIGHT} />
                        </Pressable>
                      )}
                      
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => handleDelete(item.id, item.label, item.locationName)}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={18} color="#D93838" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.addressBody}>
                    <Text style={styles.locationName}>{item.locationName}</Text>
                    {item.details ? <Text style={styles.addressDetails}>{item.details}</Text> : null}
                    {item.landmark ? (
                      <Text style={styles.addressLandmark}>
                        <Ionicons name="flag-outline" size={11} color={TEXT_LIGHT} /> {item.landmark}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.selectionIndicatorRow}>
                    {isSelected ? (
                      <View style={styles.selectedRow}>
                        <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />
                        <Text style={styles.selectedText}>Active Delivery Address</Text>
                      </View>
                    ) : (
                      <Text style={styles.tapToSelectText}>Tap to deliver here</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Sticky Bottom Add Button */}
          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [
                styles.stickyAddBtn,
                pressed && styles.stickyAddBtnPressed
              ]}
              onPress={() => navigation.navigate('AddNewAddress')}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.stickyAddBtnText}>Add New Address</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddressManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  listHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_LIGHT,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  addressCardSelected: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  labelBadgeActive: {
    backgroundColor: PRIMARY,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  labelTextActive: {
    color: 'white',
  },
  defaultBadge: {
    backgroundColor: 'rgba(200, 200, 200, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    marginBottom: 14,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  addressLandmark: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginTop: 6,
    lineHeight: 16,
  },
  selectionIndicatorRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  tapToSelectText: {
    fontSize: 13,
    color: TEXT_LIGHT,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  stickyAddBtn: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  stickyAddBtnPressed: {
    opacity: 0.9,
  },
  stickyAddBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDE3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D1321',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#5C4A3D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

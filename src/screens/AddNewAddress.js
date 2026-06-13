import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { UNILAG_LOCATIONS } from '../data/locations';
import { AddressContext } from '../context/AddressContext';

const PRIMARY = '#FF6B00';
const BG = '#F8F9FA';
const TEXT = '#0D1321';
const TEXT_MUTED = '#5C4A3D';
const TEXT_LIGHT = '#9A948C';
const BORDER = 'rgba(0, 0, 0, 0.08)';

const AddNewAddress = () => {
  const navigation = useNavigation();
  const { addAddress } = useContext(AddressContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter locations as the user types
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      return;
    }

    const filtered = UNILAG_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchQuery]);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleSave = () => {
    if (!selectedLocation) {
      alert('Please select a campus location first.');
      return;
    }

    const newAddressObj = {
      id: Date.now().toString(),
      locationName: selectedLocation.name,
      locationId: selectedLocation.id,
      label: 'Campus',
      isDefault: isDefault,
    };

    addAddress(newAddressObj);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Add New Address" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Location Search Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Campus Location</Text>
              
              {!selectedLocation ? (
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="search-outline" size={20} color={TEXT_LIGHT} style={styles.icon} />
                    <TextInput
                      placeholder="Search for Hostel, Faculty, Main Gate..."
                      placeholderTextColor={TEXT_LIGHT}
                      style={styles.textInput}
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color={TEXT_LIGHT} />
                      </Pressable>
                    )}
                  </View>

                  {/* Autocomplete Suggestions (using mapped Views instead of FlatList to avoid nesting issues) */}
                  {showSuggestions && filteredLocations.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {filteredLocations.slice(0, 8).map((item) => (
                        <Pressable
                          key={item.id}
                          style={({ pressed }) => [
                            styles.suggestionItem,
                            pressed && styles.suggestionItemPressed
                          ]}
                          onPress={() => handleSelectLocation(item)}
                        >
                          <Ionicons name="location-sharp" size={18} color={PRIMARY} style={styles.suggestionIcon} />
                          <Text style={styles.suggestionText}>{item.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {showSuggestions && searchQuery.trim() !== '' && filteredLocations.length === 0 && (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No campus locations found matching "{searchQuery}"</Text>
                    </View>
                  )}
                </View>
              ) : (
                /* Selected Location Card */
                <View style={styles.selectedCard}>
                  <View style={styles.selectedCardLeft}>
                    <View style={styles.pinIconWrap}>
                      <Ionicons name="location" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.selectedCardInfo}>
                      <Text style={styles.selectedName}>{selectedLocation.name}</Text>
                      <Text style={styles.selectedSubtext}>University of Lagos, Akoka</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.changeLocationBtn}
                    onPress={() => {
                      setSelectedLocation(null);
                      setSearchQuery('');
                      setShowSuggestions(true);
                    }}
                  >
                    <Text style={styles.changeLocationText}>Change</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Address Details Fields */}
            {selectedLocation && (
              <View style={styles.detailsSection}>
                {/* Set as Default Toggle */}
                <View style={styles.defaultToggleRow}>
                  <View style={styles.toggleTextWrap}>
                    <Text style={styles.toggleLabel}>Set as default address</Text>
                    <Text style={styles.toggleSubtext}>This will be selected automatically for checkouts</Text>
                  </View>
                  <Switch
                    value={isDefault}
                    onValueChange={setIsDefault}
                    trackColor={{ false: '#E0E0E0', true: '#FDE3D3' }}
                    thumbColor={isDefault ? PRIMARY : '#F4F3F4'}
                  />
                </View>

                {/* Save Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed
                  ]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.saveBtnText}>Save Address</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddNewAddress;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    fontFamily: 'Inter_400Regular',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  suggestionItemPressed: {
    backgroundColor: '#FAF7F4',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '500',
  },
  noResultsContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 999,
  },
  noResultsText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FDE3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCardInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  selectedSubtext: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  changeLocationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FAF7F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  changeLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  detailsSection: {
    marginTop: 10,
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 28,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  toggleSubtext: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnPressed: {
    opacity: 0.9,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
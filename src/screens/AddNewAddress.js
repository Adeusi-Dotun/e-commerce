import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppText as Text } from '../components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { AddressContext } from '../context/AddressContext';

const PRIMARY = '#FF6B00'; // swap for your single brand colour when you unify them
const BG = '#F8F9FA';
const CARD = '#FFFFFF';
const TEXT = '#0D1321';
const TEXT_MUTED = '#5C4A3D';
const TEXT_LIGHT = '#9A948C';
const BORDER = 'rgba(0, 0, 0, 0.08)';
const DANGER = '#B3261E';

// Turn the geocoder result into one readable line, dropping repeated parts.
const buildAddressText = (place) => {
  if (!place) return '';
  const parts = [place.name, place.street, place.district, place.city || place.subregion];
  const seen = new Set();
  return parts
    .filter(Boolean)
    .filter((part) => {
      const key = String(part).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
};

const AddNewAddress = () => {
  const navigation = useNavigation();
  const { addAddress, addresses } = useContext(AddressContext);

  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng } when a location is pinned
  const [isDefault, setIsDefault] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [saving, setSaving] = useState(false);

  const isFirstAddress = addresses.length === 0;

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location is turned off for UniMart. You can type your address below instead.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });

      // Reverse geocoding can fail or come back rough. The coordinates are
      // already saved either way, so failing here is fine.
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const text = buildAddressText(place);
        if (text) setAddressLine(text);
      } catch (e) {
        // leave the field for the user to type
      }
    } catch (e) {
      setLocationError("We couldn't get your location. Make sure location is on, or type your address below.");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    const line = addressLine.trim();
    if (line.length < 5) {
      Alert.alert('Add your address', 'Type your delivery address or use your current location.');
      return;
    }

    setSaving(true);
    const { error } = await addAddress({
      addressLine: line,
      landmark: landmark.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      isDefault,
    });
    setSaving(false);

    if (error) {
      Alert.alert("Couldn't save address", 'Please check your connection and try again.');
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Add New Address" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Address input (suggestions will appear right under this later) */}
          <Text style={styles.label}>Delivery address</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Search or type your address"
            placeholderTextColor={TEXT_LIGHT}
            value={addressLine}
            onChangeText={setAddressLine}
            multiline
            textAlignVertical="top"
          />
          {/* SUGGESTIONS LIST GOES HERE (added later) */}
          {coords ? (
            <Text style={styles.hint}>
              GPS can be off by a street. Check the address above and fix it if needed.
            </Text>
          ) : null}

          {/* Current location */}
          <Pressable
            style={({ pressed }) => [styles.locationBtn, pressed && styles.pressed]}
            onPress={handleUseCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color={PRIMARY} />
            ) : (
              <Ionicons name="locate" size={20} color={PRIMARY} />
            )}
            <Text style={styles.locationBtnText}>
              {locating ? 'Finding you...' : 'Use my current location'}
            </Text>
          </Pressable>

          {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

          {coords ? (
            <View style={styles.pinnedRow}>
              <Ionicons name="checkmark-circle" size={16} color={PRIMARY} />
              <Text style={styles.pinnedText}>Location pinned</Text>
              <Pressable onPress={() => setCoords(null)} hitSlop={8}>
                <Text style={styles.removePin}>Remove</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Landmark */}
          <Text style={[styles.label, styles.labelSpaced]}>Landmark (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. opposite the blue gate"
            placeholderTextColor={TEXT_LIGHT}
            value={landmark}
            onChangeText={setLandmark}
          />

          {/* Default toggle: the first address is always the default, so hide it */}
          {!isFirstAddress ? (
            <View style={styles.defaultRow}>
              <View style={styles.defaultText}>
                <Text style={styles.defaultLabel}>Set as default address</Text>
                <Text style={styles.defaultSub}>Used for delivery and shown on the home screen</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#E0E0E0', true: '#FDE3D3' }}
                thumbColor={isDefault ? PRIMARY : '#F4F3F4'}
              />
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || saving) && styles.pressed,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save address</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddNewAddress;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.8 },

  locationBtn: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  locationBtnText: { fontSize: 16, fontWeight: '700', color: PRIMARY },
  errorText: { fontSize: 13, color: DANGER, marginTop: 10, lineHeight: 19 },
  pinnedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  pinnedText: { flex: 1, fontSize: 13, color: TEXT_MUTED },
  removePin: { fontSize: 13, fontWeight: '600', color: PRIMARY },

  label: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8 },
  labelSpaced: { marginTop: 18 },
  input: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: TEXT,
  },
  inputMultiline: { minHeight: 40 },
  hint: { fontSize: 12.5, color: TEXT_LIGHT, marginTop: 8, lineHeight: 18 },

  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginTop: 22,
  },
  defaultText: { flex: 1 },
  defaultLabel: { fontSize: 15, fontWeight: '700', color: TEXT },
  defaultSub: { fontSize: 12.5, color: TEXT_LIGHT, marginTop: 3 },

  saveBtn: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
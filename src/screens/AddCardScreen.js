import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText as Text } from '../components/CustomText';
import CustomHeader from '../components/CustomHeader';

const AddCardScreen = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [setDefault, setSetDefault] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
    } else {
      setExpiry(cleaned);
    }
  };

  const handleCvvChange = (text) => {
    setCvv(text.replace(/\D/g, '').slice(0, 4));
  };

  const handleSave = () => {
    // TODO: integrate with payment gateway
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Add New Card" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Card Number</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={20}
              color="#BDBDBD"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              maxLength={19}
            />
            {/* Mastercard logo replica using two overlapping circles */}
            <View style={styles.mastercardLogo}>
              <View style={[styles.mcCircle, styles.mcRed]} />
              <View style={[styles.mcCircle, styles.mcYellow]} />
            </View>
          </View>
        </View>

        {/* Expiry + CVV row */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="MM/YY"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                value={expiry}
                onChangeText={handleExpiryChange}
                maxLength={5}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="···"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                secureTextEntry={!showCvv}
                value={cvv}
                onChangeText={handleCvvChange}
                maxLength={4}
              />
              <Pressable onPress={() => setShowCvv((v) => !v)} style={styles.cvvIcon}>
                <Ionicons
                  name={showCvv ? 'eye-outline' : 'help-circle-outline'}
                  size={20}
                  color="#BDBDBD"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Cardholder Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter name on card"
              placeholderTextColor="#BDBDBD"
              autoCapitalize="words"
              value={cardholderName}
              onChangeText={setCardholderName}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Save card toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Save card for future use</Text>
          <Switch
            value={saveCard}
            onValueChange={setSaveCard}
            trackColor={{ false: '#E0E0E0', true: '#FF6B00' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        <View style={styles.divider} />

        {/* Set as default toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={styles.toggleLabel}>Set as default payment method</Text>
            <Text style={styles.toggleSub}>
              Use this card for future purchases automatically.
            </Text>
          </View>
          <Switch
            value={setDefault}
            onValueChange={setSetDefault}
            trackColor={{ false: '#E0E0E0', true: '#FF6B00' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* Security badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="lock-closed" size={18} color="#2E7D5B" />
          <Text style={styles.securityText}>Your payment info is encrypted</Text>
          <View style={styles.paystackRow}>
            <Text style={styles.securedBy}>Secured by </Text>
            <Text style={styles.paystackBrand}>Paystack</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save button pinned at bottom */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Payment Method</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AddCardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  /* Field groups */
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3D2C2C',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
  },
  cvvIcon: {
    paddingLeft: 8,
  },

  /* Mastercard logo */
  mastercardLogo: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  mcCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  mcRed: {
    backgroundColor: '#EB001B',
    zIndex: 1,
  },
  mcYellow: {
    backgroundColor: '#F79E1B',
    marginLeft: -10,
  },

  /* Side-by-side row */
  rowFields: {
    flexDirection: 'row',
    marginBottom: 0,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },

  /* Toggles */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  toggleSub: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
  },

  /* Security badge */
  securityBadge: {
    backgroundColor: '#EBF3FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D5B',
    marginTop: 4,
  },
  paystackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securedBy: {
    fontSize: 13,
    color: '#757575',
  },
  paystackBrand: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

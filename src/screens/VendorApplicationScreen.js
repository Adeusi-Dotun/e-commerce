import { AppText as Text } from '../components/CustomText';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PRIMARY = '#FF6B00';

const categoryTags = [
  { label: 'Food & Drinks', icon: 'fast-food-outline' },
  { label: 'Clothing', icon: 'shirt-outline' },
  { label: 'Fashion & Accessories', icon: 'bag-outline' },
  { label: 'Pharmacy', icon: 'medkit-outline' },
  { label: 'Electronics', icon: 'phone-portrait-outline' },
  { label: 'Beauty & Skincare', icon: 'sparkles-outline' },
  { label: 'Stationery', icon: 'book-outline' },
  { label: 'Laundry & Cleaning', icon: 'water-outline' },
];

const progressSteps = ['Personal', 'Business', 'Verify'];

const VendorApplicationScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useContext(AuthContext);

  const [businessName, setBusinessName] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((currentTags) => {
      if (currentTags.includes(tag)) {
        return currentTags.filter((item) => item !== tag);
      }

      if (currentTags.length >= 3) {
        return currentTags;
      }

      return [...currentTags, tag];
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in before applying to become a vendor.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('vendor_applications')
        .insert({
          user_id: user.id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: user.email || '',
          business_name: businessName.trim(),
          campus_location: campusLocation.trim(),
          business_description: businessDescription.trim(),
          cac_number: cacNumber.trim() || null,
          tags: selectedTags,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (error) {
      Alert.alert('Application failed', error.message || 'Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  if (submitted) {
    return (
      <KeyboardAvoidingView style={styles.screen}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={90} color={PRIMARY} />
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successSubtitle}>
            We'll review your application and notify you within 24-48 hours.
          </Text>
          <Pressable style={styles.homeButton} onPress={goHome}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>
        </View>

        <View style={styles.progressCard}>
          {progressSteps.map((step, index) => {
            const active = index === 0;

            return (
              <View
                key={step}
                style={[styles.progressPill, active ? styles.progressPillActive : styles.progressPillInactive]}
              >
                <Text style={[styles.progressText, active && styles.progressTextActive]}>
                  Step {index + 1}: {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader icon="person-outline" title="Personal Information" />

          <View style={styles.nameRow}>
            <LockedInput value={profile?.first_name || ''} placeholder="First name" />
            <LockedInput value={profile?.last_name || ''} placeholder="Last name" />
          </View>

          <LockedInput value={user?.email || ''} placeholder="Email address" />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader icon="storefront-outline" title="Business Details" />

          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Dotun's Kitchen"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            value={campusLocation}
            onChangeText={setCampusLocation}
            placeholder="e.g. Amina Hostel, Faculty of Science Block"
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={businessDescription}
            onChangeText={setBusinessDescription}
            placeholder="Tell customers what you sell and what makes you different..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader icon="pricetag-outline" title="Business Category" />
          <Text style={styles.sectionSubtitle}>Select up to 3 tags that best describe your business</Text>

          <View style={styles.tagsRow}>
            {categoryTags.map((tag) => {
              const selected = selectedTags.includes(tag.label);

              return (
                <Pressable
                  key={tag.label}
                  style={[styles.tagPill, selected && styles.tagPillSelected]}
                  onPress={() => toggleTag(tag.label)}
                >
                  <Ionicons name={tag.icon} size={15} color={selected ? PRIMARY : '#777'} />
                  <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader icon="shield-checkmark-outline" title="Verification" />

          <TextInput
            style={styles.input}
            value={cacNumber}
            onChangeText={setCacNumber}
            placeholder="CAC Number (optional)"
            placeholderTextColor="#999"
          />

          <Text style={styles.cacNote}>Don't have a CAC? No problem - you can add it later</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Your application will be reviewed within 24-48 hours. You'll be notified once approved.
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={18} color={PRIMARY} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const LockedInput = ({ value, placeholder }) => (
  <View style={styles.lockedInput}>
    <TextInput
      style={styles.lockedTextInput}
      value={value}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      editable={false}
    />
    <Ionicons name="lock-closed-outline" size={14} color="#aaa" />
  </View>
);

export default VendorApplicationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 34,
    gap: 18,
  },
  intro: {
    gap: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'grey',
  },
  progressCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  progressPill: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPillActive: {
    backgroundColor: PRIMARY,
  },
  progressPillInactive: {
    backgroundColor: 'rgba(200,200,200,0.18)',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777',
  },
  progressTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    gap: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'grey',
    lineHeight: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lockedInput: {
    flex: 1,
    minHeight: 52,
    backgroundColor: 'rgba(200,200,200,0.15)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  lockedTextInput: {
    flex: 1,
    color: '#777',
    fontSize: 14,
    paddingVertical: 0,
  },
  input: {
    minHeight: 54,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.6)',
    paddingHorizontal: 14,
    color: '#111',
    fontSize: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  descriptionInput: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.8)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagPillSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderColor: PRIMARY,
  },
  tagText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '600',
  },
  tagTextSelected: {
    color: PRIMARY,
    fontWeight: '700',
  },
  cacNote: {
    color: 'grey',
    fontSize: 12,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
    padding: 14,
  },
  infoText: {
    color: '#5C4A3D',
    fontSize: 13,
    lineHeight: 20,
  },
  submitButton: {
    width: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },
  successSubtitle: {
    color: 'grey',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 12,
  },
  homeButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: 180,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

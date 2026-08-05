import React, { useMemo, useState, useEffect } from 'react';
import {View, ScrollView, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Switch, Dimensions} from 'react-native';
import { supabase } from '../lib/supabase';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppText as Text } from '../components/CustomText';
import * as ImagePicker from 'expo-image-picker';
import { Image } from "react-native";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const SLOT_SIZE = (SCREEN_WIDTH - 80 - GRID_GAP * 2) / 3;

const PRIMARY = '#FF6B00';
const BG = '#FAFAF9';

const CATEGORIES = [
  'Food & Meals',
  'Snacks & Drinks',
  'Groceries',
  'Fashion',
  'Electronics',
  'Beauty',
];

function SectionCard({ number, title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>
        <Text style={styles.cardNumber}>{number} </Text>
        {title}
      </Text>
      {children}
    </View>
  );
}

function FloatingField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  suffix,
  prefix,
  keyboardType,
  icon,
}) {
  const [focused, setFocused] = useState(false);
  const showLabel = focused || (value && value.length > 0);

  return (
    <View style={[styles.fieldWrap, focused && styles.fieldWrapFocused]}>
      {showLabel && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.fieldRow}>
        {icon && (
          <Ionicons name={icon} size={16} color="#999" style={styles.fieldIcon} />
        )}
        {prefix && <Text style={styles.fieldPrefix}>{prefix}</Text>}
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={showLabel ? '' : placeholder || label}
          placeholderTextColor="#BBB"
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && <Text style={styles.fieldSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function OrangeSwitch({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E5E5', true: PRIMARY }}
      thumbColor="#fff"
      ios_backgroundColor="#E5E5E5"
    />
  );
}

function ToggleRow({ icon, iconBg, iconColor, title, subtitle, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <OrangeSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function AddProductScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext)
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Meals');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [available, setAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState('15');
  const [status, setStatus] = useState('active');
  const [variants, setVariants] = useState([{ id: '1', name: 'Size', values: 'Small, Medium, Large' }]);

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const MAX_IMAGES = 5;


  const fetchVendor = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setVendor(data);
    setLoading(false);  
  };

  useEffect(() => {
    fetchVendor();
  },[user]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return CATEGORIES;
    return CATEGORIES.filter((c) =>
      c.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const removeVariant = (id) => {
    setVariants((current) => current.filter((v) => v.id !== id));
  };


  const addProduct = async () => {

    console.log("Publish button pressed");

    console.log("Vendor:", vendor);
    console.log("Images:", images);


    const imageUrls = await uploadImages();

    console.log("Uploaded URLs:", imageUrls);

    const { data , error} = await supabase
      .from ("products")
      .insert ([
        {
          vendor_id: vendor.id,
          name: productName,
          description,
          price: Number(price),
          category,
          stock: Number(stockQuantity),
          images: imageUrls,
          is_available: true
        },
      ])
      .select()
      .single();


      console.log("Insert data:", data);
      console.log("Insert error:", error);


      if(error) {
        console.log(error);
        return;
      }

      alert ("Product added successfully!");

      resetForm();

      navigation.goBack();
  }

  const pickImage = async () => {
  const permission =  await ImagePicker.requestMediaLibraryPermissionsAsync();
    

  if (!permission.granted) {
    alert("Permission denied");
    return;
  }

  const remaining = MAX_IMAGES - images.length;

  if (remaining <= 0) {
    alert(`You can only select up to ${MAX_IMAGES} images.`);
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
      });

  if (result.canceled) return;

   const newImages = [...images, ...result.assets]

    setImages(newImages.slice(0, MAX_IMAGES));
    
  }; 


  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  
  const uploadImages = async () => {

  const imageUrls = [];

  for (const image of images) {

    try {
   
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

    const fileExt = image.uri.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

    console.log("about to upload....");

    const { data: uploadData, error } = await supabase.storage
      .from("products")
      .upload(fileName, decode(base64), {contentType: image.mimeType});

      if (error) {
      console.log(error);
      return null;
    }

      console.log('UPLOAD SUCCESS:', uploadData);

      const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

      imageUrls.push(publicUrlData.publicUrl);

    } catch (err) {
      console.log("Upload error:", err);
      return null;
    }
  }

  return imageUrls;
};


const resetForm = () => {
  setImages([]);
  setProductName('');
  setDescription('');
  setCategory('Food & Meals');
  setPrice('');
  setStockQuantity('');
  setAvailable(true);
  setPrepTime('15');
  setStatus('active');
  setVariants([{ id: '1', name: 'Size', values: 'Small, Medium, Large' }]);
};



  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Add Product</Text>
        <Pressable>
          <Text style={styles.saveDraftLink}>Save Draft</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 01 Product Images */}
          <SectionCard number="01" title="Product Images">
            <View style={styles.imageGrid}>
              {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                const image = images[index];
                return (
                  <Pressable
                    key={index}
                    style={styles.imageSlot}
                    onPress={!image ? pickImage : undefined }
                  >
                    {image ? (
                      <>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.imagePlaceholder}
                        />
                        <Pressable
                          style={styles.removeImageBtn}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close-circle" size={20} color="#FF6B00" />
                        </Pressable>
                      </>
                    ) : (
                      <View style={styles.imageSlotInner}>
                        <Ionicons name="add" size={24} color="#999" />
                        {index === 0 && (
                          <Text style={styles.imageAddText}>Add Photo</Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.imageHint}>Add up to 5 photos. First photo is the cover.</Text>
          </SectionCard>

          {/* 02 Product Information */}
          <SectionCard number="02" title="Product Information">
            <FloatingField
              label="PRODUCT NAME"
              value={productName}
              onChangeText={setProductName}
              placeholder="Product Name"
            />
            <View style={styles.fieldGap} />
            <FloatingField
              label="DESCRIPTION"
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
            />
            <View style={styles.fieldGap} />

            {/* Category picker */}
            <Pressable
              style={[styles.fieldWrap, categoryOpen && styles.fieldWrapFocused]}
              onPress={() => setCategoryOpen((o) => !o)}
            >
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.categoryValue}>{category}</Text>
                <Ionicons
                  name={categoryOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#999"
                />
              </View>
            </Pressable>

            {categoryOpen && (
              <View style={styles.categoryDropdown}>
                <View style={styles.categorySearchWrap}>
                  <Ionicons name="search-outline" size={16} color="#999" />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search categories"
                    placeholderTextColor="#BBB"
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                  />
                </View>
                {filteredCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.categoryItem, category === cat && styles.categoryItemActive]}
                    onPress={() => {
                      setCategory(cat);
                      setCategoryOpen(false);
                      setCategorySearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat && styles.categoryItemTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                    {category === cat && (
                      <Ionicons name="checkmark" size={18} color={PRIMARY} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </SectionCard>

          {/* 03 Pricing */}
          <SectionCard number="03" title="Pricing">
            <FloatingField
              label="PRICE"
              value={price}
              onChangeText={setPrice}
              prefix="₦"
              keyboardType="numeric"
            />
          </SectionCard>

          {/* 04 Inventory */}
          <SectionCard number="04" title="Inventory">
            <FloatingField
              label="STOCK QUANTITY"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="numeric"
              suffix="units"
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="layers-outline"
              iconBg="#E8F4FD"
              iconColor="#3B82F6"
              title="Availability"
              subtitle="Available for purchase"
              value={available}
              onValueChange={setAvailable}
            />
            <View style={styles.divider} />
          </SectionCard>

          {/* 05 Additional Details */}
          <SectionCard number="05" title="Additional Details">
            <FloatingField
              label="PREPARATION TIME — OPTIONAL"
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
              suffix="min"
              icon="time-outline"
            />
            <View style={styles.fieldGap} />

            <Text style={styles.statusLabel}>PRODUCT STATUS</Text>
            <View style={styles.statusSegment}>
              <Pressable
                style={[styles.statusOption, status === 'active' && styles.statusOptionActive]}
                onPress={() => setStatus('active')}
              >
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={status === 'active' ? '#111' : '#999'}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    status === 'active' && styles.statusOptionTextActive,
                  ]}
                >
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[styles.statusOption, status === 'hidden' && styles.statusOptionActive]}
                onPress={() => setStatus('hidden')}
              >
                <Ionicons
                  name="eye-off-outline"
                  size={16}
                  color={status === 'hidden' ? '#111' : '#999'}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    status === 'hidden' && styles.statusOptionTextActive,
                  ]}
                >
                  Hidden
                </Text>
              </Pressable>
            </View>

            <View style={styles.variantsHeader}>
              <Text style={styles.variantsLabel}>VARIANTS — optional</Text>
              <Pressable>
                <Text style={styles.variantsAdd}>+ Add</Text>
              </Pressable>
            </View>

            {variants.map((variant) => (
              <View key={variant.id} style={styles.variantCard}>
                <View style={styles.variantTop}>
                  <Text style={styles.variantName}>{variant.name}</Text>
                  <Pressable onPress={() => removeVariant(variant.id)}>
                    <Ionicons name="close" size={18} color="#999" />
                  </Pressable>
                </View>
                <Text style={styles.variantValues}>{variant.values}</Text>
              </View>
            ))}
          </SectionCard>
        </ScrollView>

        {/* Sticky bottom bar */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.draftBtn}>
            <Text style={styles.draftBtnText}>Save as Draft</Text>
          </Pressable>
          <Pressable style={styles.publishBtn}
            onPress={addProduct}>
            <Text style={styles.publishBtnText}>Publish Product</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },
  saveDraftLink: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
  },
  cardNumber: {
    color: '#999',
    fontWeight: '600',
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  imageSlot: {
    width: SLOT_SIZE,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },

  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  coverLabelText: {
    fontSize: 70,
    fontWeight: '700',
    color: '#fff',
  },

  imageAddBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 6,
  },
  imageAddText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
  imageSlotInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  
  imagePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    fontSize: 13,
    color: '#888',
    marginTop: 12,
  },

  fieldWrap: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  fieldWrapFocused: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginRight: 4,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    padding: 0,
  },
  fieldInputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  fieldSuffix: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginLeft: 8,
  },
  fieldGap: {
    height: 12,
  },

  categoryValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  categoryDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  categorySearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    padding: 0,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F5F5F5',
  },
  categoryItemActive: {
    backgroundColor: '#FAFAFA',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#444',
  },
  categoryItemTextActive: {
    fontWeight: '600',
    color: '#111',
  },



  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  statusOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  statusOptionTextActive: {
    fontWeight: '700',
    color: '#111',
  },

  variantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  variantsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
  },
  variantsAdd: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  variantCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  variantTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  variantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  variantValues: {
    fontSize: 13,
    color: '#888',
  },

  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
  },
  draftBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  draftBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  publishBtn: {
    flex: 1.4,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

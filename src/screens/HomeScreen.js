import { AppText as Text } from '../components/CustomText';
import { Dimensions, Image, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { AddressContext } from '../context/AddressContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.57, 228);
const fallbackImage = 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800&q=80';

const mockVendors = [
  { id: 'mock-glow-lab', name: 'Glow Lab Beauty', business_category: 'Beauty', location: 'Jaja Hall', description: 'Beauty essentials & self care', rating: '4.9', delivery: '20–30 min', price: 'From ₦2,500', badge: 'Save ₦2,000', menu: [{ image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=85' }] },
  { id: 'mock-solecraft', name: 'SoleCraft Kicks', business_category: 'Fashion', location: 'New Hall', description: 'Sneakers and campus style', rating: '4.7', delivery: '15–25 min', price: 'From ₦8,000', badge: 'Campus pick', menu: [{ image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85' }] },
  { id: 'mock-chopspot', name: 'The Chop Spot', business_category: 'Food', location: 'Moremi Hall', description: 'Fast, filling campus meals', rating: '4.8', delivery: '20–30 min', price: 'From ₦1,800', badge: 'Free pickup', menu: [{ image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=85' }] },
];

const categories = [
  { label: 'All', icon: 'sparkles', color: '#6D3CC7' }, { label: 'Food', icon: 'fast-food', color: '#F36A21' },
  { label: 'Fashion', icon: 'bag-handle', color: '#128775' }, { label: 'Beauty', icon: 'flower-outline', color: '#D42D7B' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { selectedAddress } = useContext(AddressContext);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  
useEffect(() => {
  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.log('Could not load vendors:', error.message);
      return;
    }

    const vendorList = data || [];

    // Fetch products belonging to these vendors.
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('vendor_id, images, created_at')
      .in(
        'vendor_id',
        vendorList.map(vendor => vendor.id)
      )
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (productsError) {
      console.log('Could not load vendor products:', productsError.message);
      setVendors(vendorList);
      return;
    }

    // Attach the first product image to each vendor.
    const vendorsWithImages = vendorList.map(vendor => {
      const firstProduct = products?.find(
        product => product.vendor_id === vendor.id &&
          Array.isArray(product.images) &&
          product.images.length > 0
      );

      return {
        ...vendor,
        image: firstProduct?.images?.[0] || null,
      };
    });

    setVendors(vendorsWithImages);
  };

  fetchVendors();
}, []);

  
const displayVendors = useMemo(() => {
  const liveNames = new Set(
    vendors.map(vendor => vendor.name?.toLowerCase())
  );

  const allVendors = [
    ...vendors,
    ...mockVendors.filter(
      vendor => !liveNames.has(vendor.name.toLowerCase())
    ),
  ];

  // Show every vendor when "All" is selected.
  if (selectedCategory === 'All') {
    return allVendors;
  }

  // Otherwise, show only vendors in the selected category.
  return allVendors.filter(
    vendor =>
      vendor.business_category?.toLowerCase() ===
      selectedCategory.toLowerCase()
  );
}, [vendors, selectedCategory]);

  const destination = selectedAddress?.label || selectedAddress?.name || selectedAddress?.address || 'Select address';

  const vendorCard = (vendor, isDeal = false) => (
    <Pressable key={String(vendor.id)} style={[styles.vendorCard, isDeal && styles.dealCard]} onPress={() => navigation.navigate('VendorDetails', { vendor })}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: vendor.menu?.[0]?.image || vendor.image || fallbackImage }} style={styles.cardImage} />
        <View style={[styles.cardBadge, isDeal && styles.dealBadge]}><Text style={[styles.badgeText, isDeal && styles.dealBadgeText]}>{isDeal ? vendor.badge || '25% OFF' : `★ ${vendor.rating || '4.8'}`}</Text></View>
        <Pressable style={styles.heartButton} hitSlop={8} onPress={event => event.stopPropagation()}><Ionicons name="heart-outline" size={15} color="#3B2A20" /></Pressable>
        {!isDeal && <View style={styles.deliveryPill}><Ionicons name="bicycle-outline" size={10} color="#FFF" /><Text style={styles.deliveryText}>{vendor.delivery || '20–30 min'}</Text></View>}
      </View>
      <View style={styles.cardCopy}>
        <Text numberOfLines={1} style={styles.cardTitle}>{vendor.name}</Text>
        <Text numberOfLines={1} style={styles.cardSubtitle}>{vendor.description || vendor.tags?.join(' · ') || 'Campus favourite'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{vendor.price || 'From ₦17,0 00'}</Text>
          {isDeal ? <View style={styles.addButton}><Ionicons name="add" size={15} color="#FFF" /></View> : <Text style={styles.smallRating}>★ {vendor.rating || '4.8'}</Text>}
        </View>
      </View>
    </Pressable>
  );

  return <SafeAreaView style={styles.safeArea} edges={['top']}>
    <StatusBar barStyle="light-content" backgroundColor="#D94A06" />
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <Pressable style={styles.locationButton} onPress={() => navigation.navigate('AddressManagement')}>
            <View style={styles.locationIcon}><Ionicons name="location" size={16} color="#D94A06" /></View>
            <View><Text style={styles.deliverTo}>DELIVER TO</Text><View style={styles.destinationRow}><Text numberOfLines={1} style={styles.destination}>{destination}</Text><Ionicons name="chevron-down" size={14} color="#FFF" /></View></View>
          </Pressable>
          <Pressable style={styles.bellButton} accessibilityLabel="Notifications"><Ionicons name="notifications-outline" size={22} color="#FFF" /><View style={styles.notificationDot} /></Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Category</Text><Pressable onPress={() => navigation.navigate('Categories')}><Text style={styles.seeAll}>See all <Ionicons name="chevron-forward" size={12} /></Text></Pressable></View>
        <View style={styles.categoryRail}>{categories.map(category => {
          const isActive = selectedCategory === category.label;
          return <Pressable key={category.label} style={styles.categoryItem} onPress={() => setSelectedCategory(category.label)}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }, isActive && styles.activeCategoryIcon]}><Ionicons name={category.icon} size={22} color="#FFF" /></View>
            <Text style={[styles.categoryLabel, isActive && styles.activeCategoryLabel]}>{category.label}</Text>
            <View style={[styles.categoryIndicator, isActive && styles.activeCategoryIndicator]} />
          </Pressable>;
        })}</View>
      </View>

      <View style={[styles.section, styles.fullWidthSection]}>
        <View style={[styles.sectionHeader, styles.insetHeader]}><View style={styles.titleWithIcon}><Text style={styles.lightning}>ϟ</Text><Text style={styles.sectionTitle}>Top Deals for the Day</Text><View style={styles.endsBadge}></View></View><Pressable><Text style={styles.seeAll}>See all <Ionicons name="chevron-forward" size={12} /></Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>{displayVendors.slice(0, 4).map(vendor => vendorCard(vendor, true))}</ScrollView>
      </View>

      <View style={[styles.section, styles.fullWidthSection, styles.popularSection]}>
        <Text style={styles.popularTitle}>Popular near you</Text><Text style={styles.popularCaption}>Top-rated campus vendors delivering in under 30 mins</Text>
        <View style={[styles.sectionHeader, styles.insetHeader, styles.trendingHeader]}><View style={styles.titleWithIcon}><Ionicons name="flame-outline" size={15} color="#D94A06" /><Text style={styles.trendingTitle}>Trending on Campus</Text></View><Pressable><Text style={styles.seeAll}>See all <Ionicons name="chevron-forward" size={12} /></Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>{displayVendors.map(vendor => vendorCard(vendor))}</ScrollView>
      </View>

      <Pressable style={styles.sellBanner} onPress={() => navigation.navigate('VendorGate')}><View><Text style={styles.sellTitle}>Have something to sell?</Text><Text style={styles.sellSubtitle}>Open your shop on UniMart</Text></View><View style={styles.sellIcon}><Ionicons name="storefront-outline" size={21} color="#D94A06" /></View></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#D94A06' }, screen: { flex: 1, backgroundColor: '#FFFDFC' }, content: { paddingBottom: 30 },
  hero: { backgroundColor: '#D94A06', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, locationButton: { flexDirection: 'row', alignItems: 'center', flex: 1 }, locationIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#FFF4ED', alignItems: 'center', justifyContent: 'center', marginRight: 8 }, deliverTo: { fontSize: 9, lineHeight: 12, fontWeight: '700', color: '#FFE3D3' }, destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, destination: { maxWidth: 230, color: '#FFF', fontSize: 15, fontWeight: '800' }, bellButton: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, notificationDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 5, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#D94A06' },
  section: { paddingHorizontal: 18, marginTop: 21 }, sectionHeader: { minHeight: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, sectionTitle: { color: '#29221E', fontSize: 18, fontWeight: '800' }, seeAll: { color: '#CF480C', fontSize: 11, fontWeight: '700' }, categoryRail: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EDE4DE', justifyContent: 'space-between' }, categoryItem: { alignItems: 'center', flex: 1, minHeight: 81, position: 'relative' }, categoryIcon: { width: 45, height: 45, borderRadius: 13, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 }, activeCategoryIcon: { transform: [{ translateY: -1 }], shadowOpacity: 0.22, elevation: 4 }, categoryLabel: { fontSize: 11, color: '#8E8178', fontWeight: '600', marginTop: 6 }, activeCategoryLabel: { color: '#332A25', fontWeight: '800' }, categoryIndicator: { position: 'absolute', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, bottom: -1, left: 12, right: 12, backgroundColor: 'transparent' }, activeCategoryIndicator: { backgroundColor: '#D94A06' },
  fullWidthSection: { paddingHorizontal: 0, marginTop: 26 }, insetHeader: { paddingHorizontal: 18 }, titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 5 }, lightning: { color: '#D94A06', fontSize: 21, fontWeight: '900', marginTop: -1 }, endsBadge: { backgroundColor: '#FBE8E1', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginLeft: 1 }, endsText: { fontSize: 8, color: '#C53E0B', fontWeight: '800' }, horizontalList: { gap: 11, paddingHorizontal: 18, paddingBottom: 4 },
  vendorCard: { width: CARD_WIDTH, backgroundColor: '#FFF', borderRadius: 13, overflow: 'hidden', borderWidth: 1, borderColor: '#F0E9E4', shadowColor: '#705543', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, dealCard: { width: CARD_WIDTH - 7 }, imageWrap: { height: 108, position: 'relative', backgroundColor: '#EEE7E1' }, cardImage: { width: '100%', height: '100%', resizeMode: 'cover' }, cardBadge: { position: 'absolute', top: 7, left: 7, backgroundColor: '#FFF', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 8 }, badgeText: { color: '#3F322A', fontSize: 9, fontWeight: '800' }, dealBadge: { backgroundColor: '#D94A06' }, dealBadgeText: { color: '#FFF' }, heartButton: { position: 'absolute', right: 7, top: 7, height: 24, width: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }, deliveryPill: { position: 'absolute', bottom: 6, left: 7, backgroundColor: 'rgba(37,31,27,0.78)', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 5, flexDirection: 'row', gap: 2, alignItems: 'center' }, deliveryText: { color: '#FFF', fontSize: 9, fontWeight: '700' }, cardCopy: { paddingHorizontal: 9, paddingTop: 8, paddingBottom: 9 }, cardTitle: { color: '#332A25', fontSize: 12.5, fontWeight: '800' }, cardSubtitle: { color: '#8C7E74', fontSize: 10, marginTop: 3 }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, minHeight: 19 }, cardPrice: { color: '#D94A06', fontSize: 11, fontWeight: '800' }, addButton: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#C8460B', alignItems: 'center', justifyContent: 'center' }, smallRating: { color: '#55443A', fontSize: 10, fontWeight: '700' },
  popularSection: { marginTop: 27 }, popularTitle: { color: '#29221E', fontSize: 20, fontWeight: '800', paddingHorizontal: 18 }, popularCaption: { color: '#8B7D73', fontSize: 10.5, marginTop: 3, paddingHorizontal: 18 }, trendingHeader: { marginTop: 8, marginBottom: 10 }, trendingTitle: { color: '#483A31', fontSize: 13, fontWeight: '800' }, sellBanner: { marginHorizontal: 18, marginTop: 27, backgroundColor: '#FFF1E9', borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#FFE1D2' }, sellTitle: { color: '#573A28', fontSize: 14, fontWeight: '800' }, sellSubtitle: { color: '#967F71', fontSize: 11, marginTop: 3 }, sellIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
});

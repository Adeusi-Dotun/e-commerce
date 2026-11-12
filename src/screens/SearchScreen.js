import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { AppText as Text } from '../components/CustomText';
import { supabase } from '../lib/supabase';
import { formatNaira } from '../utils/orders';

/* Tokens. Swap BRAND for your single brand colour when you unify them. */
const BRAND = '#A83B10';
const BRAND_SOFT = 'rgba(168, 59, 16, 0.09)';
const BG = '#FFFFFF';
const SURFACE = '#F6F6F6';
const TEXT = '#161412';
const TEXT_MUTED = '#6B645D';
const TEXT_LIGHT = '#9A9A9A';
const LINE = '#E6E6E6';

const RECENTS_KEY = 'recent_searches';
const MAX_RECENTS = 8;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;
const ALL_VENDORS = 'All vendors';

// Same categories and colours as the Home screen.
const CATEGORIES = [
  { label: 'Food', icon: 'fast-food', color: '#F36A21' },
  { label: 'Fashion', icon: 'bag-handle', color: '#128775' },
  { label: 'Beauty', icon: 'flower-outline', color: '#D42D7B' },
];

// Hand-picked for now. Swap for real counts once you collect search analytics.
const TRENDING = [
  'jollof rice',
  'shawarma',
  'suya',
  'fried rice',
  'pizza',
  'chicken',
  'burger',
  'smoothie',
];

const EMPTY_RESULTS = { vendors: [], products: [] };

// Strip characters that would break the query filter.
const cleanQuery = (text) =>
  text.replace(/[,()%*_\\]/g, ' ').replace(/\s+/g, ' ').trim();

// Pairs of categories, so the grid reads as two rows that scroll sideways.
const toColumns = (items) => {
  const columns = [];
  for (let i = 0; i < items.length; i += 2) columns.push(items.slice(i, i + 2));
  return columns;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Data. All Supabase calls live here so column names are easy to fix.
 * ──────────────────────────────────────────────────────────────────────────── */
const searchCatalog = async (q, category) => {
  let vendorQuery = supabase.from('vendors').select('*').eq('is_active', true);
  if (category && category !== ALL_VENDORS) {
    vendorQuery = vendorQuery.ilike('business_category', category);
  }
  if (q) {
    vendorQuery = vendorQuery.or(`name.ilike.*${q}*,business_category.ilike.*${q}*`);
  }

  // Products are searched by name only, and only when typing (not for a category tap).
  const productQuery =
    q && !category
      ? supabase
          .from('products')
          .select('id, name, price, images, vendor_id, vendors(*)') // CHECK: columns
          .eq('is_available', true)
          .ilike('name', `%${q}%`)
          .limit(20)
      : Promise.resolve({ data: [], error: null });

  const [vendorRes, productRes] = await Promise.all([vendorQuery.limit(20), productQuery]);
  if (vendorRes.error || productRes.error) throw vendorRes.error || productRes.error;

  return {
    vendors: vendorRes.data || [],
    // Hide products whose vendor is switched off.
    products: (productRes.data || []).filter((p) => p.vendors?.is_active !== false),
  };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Pieces
 * ──────────────────────────────────────────────────────────────────────────── */
const Chip = ({ label, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Text style={styles.chipText} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const CategoryPill = ({ category, width, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.pill, { width }, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Ionicons name={category.icon} size={24} color={category.color} />
    <Text style={styles.pillText} numberOfLines={1}>
      {category.label}
    </Text>
  </Pressable>
);

const VendorRow = ({ vendor, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    onPress={onPress}
  >
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{(vendor.name || '?').charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {vendor.name}
      </Text>
      {vendor.business_category ? (
        <Text style={styles.rowSub} numberOfLines={1}>
          {vendor.business_category}
        </Text>
      ) : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color={TEXT_LIGHT} />
  </Pressable>
);

const ProductRow = ({ product, onPress }) => {
  const image = Array.isArray(product.images) ? product.images[0] : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Ionicons name="bag-handle-outline" size={20} color={TEXT_LIGHT} />
        </View>
      )}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {product.vendors?.name || 'Vendor'}
        </Text>
      </View>
      {product.price != null ? (
        <Text style={styles.price}>{formatNaira(Number(product.price))}</Text>
      ) : null}
    </Pressable>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
 * Screen
 * ──────────────────────────────────────────────────────────────────────────── */
const SearchScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const inputRef = useRef(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [recents, setRecents] = useState([]);

  const cleaned = cleanQuery(query);
  const isSearching = cleaned.length >= MIN_QUERY_LENGTH || Boolean(activeCategory);
  const pillWidth = Math.round(screenWidth * 0.30);

  // Put the cursor in the box whenever the Search tab is opened.
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }, [])
  );

  // History lives on the phone only.
  useEffect(() => {
    AsyncStorage.getItem(RECENTS_KEY)
      .then((raw) => raw && setRecents(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const saveRecent = (text) => {
    const term = text.trim();
    if (term.length < MIN_QUERY_LENGTH) return;
    setRecents((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_RECENTS
      );
      AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    AsyncStorage.removeItem(RECENTS_KEY).catch(() => {});
  };

  // Search shortly after the user stops typing. Older responses are ignored.
  useEffect(() => {
    if (!isSearching) {
      requestId.current += 1;
      setResults(EMPTY_RESULTS);
      setStatus('idle');
      return undefined;
    }

    setStatus('loading');
    const id = ++requestId.current;

    const timer = setTimeout(async () => {
      try {
        const data = await searchCatalog(cleaned, activeCategory);
        if (id !== requestId.current) return;
        setResults(data);
        setStatus('done');
      } catch (e) {
        if (id !== requestId.current) return;
        setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [cleaned, activeCategory, isSearching]);

  const openVendor = (vendor) => {
    saveRecent(query);
    navigation.navigate('VendorDetails', { vendor });
  };

  const openProduct = (product) => {
    saveRecent(query);
    // TODO: open your product detail screen here if you have one.
    // For now this opens the product's vendor page.
    if (product.vendors) navigation.navigate('VendorDetails', { vendor: product.vendors });
  };

  const pickCategory = (label) => {
    setQuery('');
    setActiveCategory(label);
  };

  const resetSearch = () => {
    setQuery('');
    setActiveCategory(null);
    inputRef.current?.focus();
  };

  const hasResults = results.vendors.length > 0 || results.products.length > 0;
  const categoryName =
    activeCategory === ALL_VENDORS ? 'all vendors' : `${activeCategory} vendors`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Compact navigation header, followed by the primary search action. */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={26} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.inputWrap}>
        <Ionicons name="search" size={24} color={TEXT} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Find food, fashion, or vendors"
          placeholderTextColor={TEXT_LIGHT}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (activeCategory) setActiveCategory(null);
          }}
          onSubmitEditing={() => saveRecent(query)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 ? (
          <Pressable onPress={resetSearch} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={TEXT_LIGHT} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {!isSearching ? (
          <>
            {recents.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your history</Text>
                  <Pressable onPress={clearRecents} hitSlop={8}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                </View>
                <View style={styles.chipWrap}>
                  {recents.map((term) => (
                    <Chip key={term} label={term} onPress={() => setQuery(term)} />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search by category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.pillScroll}
                contentContainerStyle={styles.pillScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {toColumns(CATEGORIES).map((column, index) => (
                  <View key={index} style={styles.pillColumn}>
                    {column.map((category) => (
                      <CategoryPill
                        key={category.label}
                        category={category}
                        width={pillWidth}
                        onPress={() => pickCategory(category.label)}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending searches</Text>
              <View style={styles.chipWrap}>
                {TRENDING.map((term) => (
                  <Chip key={term} label={term} onPress={() => setQuery(term)} />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {activeCategory ? (
              <View style={styles.activeRow}>
                <Text style={styles.activeLabel}>Showing {categoryName}</Text>
                <Pressable onPress={resetSearch} hitSlop={8}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
            ) : null}

            {status === 'loading' ? (
              <View style={styles.centerState}>
                <ActivityIndicator color={BRAND} />
              </View>
            ) : null}

            {status === 'error' ? (
              <View style={styles.centerState}>
                <Text style={styles.stateTitle}>Something went wrong</Text>
                <Text style={styles.stateText}>Check your connection and try again.</Text>
              </View>
            ) : null}

            {status === 'done' && !hasResults ? (
              <View style={styles.centerState}>
                <Text style={styles.stateTitle}>
                  {activeCategory ? `No ${categoryName} yet` : `No results for “${cleaned}”`}
                </Text>
                <Text style={styles.stateText}>
                  {activeCategory
                    ? 'Check back soon, new vendors are joining.'
                    : 'Try a different spelling, or browse a category.'}
                </Text>
                <Pressable style={styles.stateBtn} onPress={resetSearch}>
                  <Text style={styles.stateBtnText}>Back to search</Text>
                </Pressable>
              </View>
            ) : null}

            {status === 'done' && results.vendors.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vendors</Text>
                {results.vendors.map((vendor) => (
                  <VendorRow
                    key={String(vendor.id)}
                    vendor={vendor}
                    onPress={() => openVendor(vendor)}
                  />
                ))}
              </View>
            ) : null}

            {status === 'done' && results.products.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products</Text>
                {results.products.map((product) => (
                  <ProductRow
                    key={String(product.id)}
                    product={product}
                    onPress={() => openProduct(product)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

/* ────────────────────────────────────────────────────────────────────────────
 * Styles
 * ──────────────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backBtn: { marginRight: 20 },
  title: { fontSize: 21 , fontWeight: '500', color: TEXT },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 45,
    marginHorizontal: 10,
    borderRadius: 24,
    borderColor: TEXT,
    paddingHorizontal: 14,
    backgroundColor: SURFACE,
  },
  input: { flex: 1, fontSize: 17, color: TEXT, padding: 0 },

  content: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: TEXT, marginBottom: 13 },
  clearText: { fontSize: 14, fontWeight: '600', color: BRAND, marginBottom: 16 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
    maxWidth: '100%',
  },
  chipText: { fontSize: 14, fontWeight: '500', color: BRAND },

  // Bleeds to the screen edge so the grid scrolls sideways like the reference.
  pillScroll: { marginHorizontal: -16 },
  pillScrollContent: { paddingHorizontal: 16, gap: 12 },
  pillColumn: { gap: 12 },
  pill: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: BG,
  },
  pillText: { fontSize: 14, fontWeight: '500', color: TEXT },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  activeLabel: { fontSize: 15, fontWeight: '600', color: TEXT_MUTED },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BRAND_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: BRAND },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: SURFACE },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  rowSub: { fontSize: 13.5, color: TEXT_MUTED, marginTop: 3 },
  price: { fontSize: 14, fontWeight: '700', color: TEXT },

  centerState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 12 },
  stateTitle: { fontSize: 17, fontWeight: '700', color: TEXT, textAlign: 'center' },
  stateText: { fontSize: 14.5, color: TEXT_MUTED, marginTop: 8, textAlign: 'center', lineHeight: 21 },
  stateBtn: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LINE,
  },
  stateBtnText: { fontSize: 15, fontWeight: '600', color: TEXT },
});

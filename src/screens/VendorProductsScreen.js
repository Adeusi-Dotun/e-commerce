import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { AppText as Text } from '../components/CustomText';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY = '#FF6B00';
const BG = '#FAFAF9';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid-outline', active: false, route: 'VendorDashboard' },
  { label: 'Products', icon: 'cube-outline', active: true, route: 'VendorProducts' },
  { label: 'Orders', icon: 'receipt-outline', active: false, route: 'VendorOrders' },
  { label: 'Messages', icon: 'chatbubble-outline', active: false },
  { label: 'Profile', icon: 'person-outline', active: false },
];

const FILTER_TABS = ['All', 'Active', 'Hidden', 'Out of Stock'];

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, iconColor, iconBg }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    active: { bg: '#DCFCE7', color: '#16A34A', label: 'Active' },
    hidden: { bg: '#F1F5F9', color: '#64748B', label: 'Hidden' },
    out_of_stock: { bg: '#FEE2E2', color: '#EF4444', label: 'Out of Stock' },
  };
  const s = config[status] ?? config.active;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

// ── Product Card ────────────────────────────────────────────────────────────────────
function ProductCard({ item, onMenuPress }) {
  const stockStatus =
    (item.stock ?? 0) === 0
      ? 'out_of_stock'
      : !item.is_available
      ? 'hidden'
      : 'active';

  return (
    <View style={styles.productCard}>
      <View style={styles.productThumb}>
        {item.images?.[0] ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="cube-outline" size={28} color="#CCC" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {item.category ?? 'Uncategorised'}
        </Text>
        <Text style={styles.productPrice}>
          ₦{Number(item.price ?? 0).toLocaleString()}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productStock}>{item.stock ?? 0} in stock</Text>
          <Text style={styles.productMetaDot}> • </Text>
          <StatusBadge status={stockStatus} />
        </View>
      </View>

      <Pressable style={styles.menuBtn} hitSlop={12} onPress={() => onMenuPress(item)}>
        <Ionicons name="ellipsis-vertical" size={18} color="#AAA" />
      </Pressable>
    </View>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────────────
function ProductContextMenu({ visible, item, onClose, onEdit, onToggleHidden, onDelete }) {
  if (!item) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuSheet}>
          <Text style={styles.menuTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Pressable style={styles.menuRow} onPress={onEdit}>
            <Ionicons name="create-outline" size={18} color="#333" />
            <Text style={styles.menuRowText}>Edit Product</Text>
          </Pressable>
          <Pressable style={styles.menuRow} onPress={onToggleHidden}>
            <Ionicons
              name={item.is_available ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#333"
            />
            <Text style={styles.menuRowText}>
              {item.is_available ? 'Hide Product' : 'Make Visible'}
            </Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuRow} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.menuRowText, { color: '#EF4444' }]}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VendorProductsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch vendor
  useEffect(() => {
    if (!user) return;
    supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => setVendor(data));
  }, [user]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!vendor?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }, [vendor?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts]) 
  );

  // Computed stats
  const total = products.length;
  const activeCount = products.filter(p => p.is_available && (p.stock ?? 0) > 0).length;
  const hiddenCount = products.filter(p => !p.is_available).length;
  const outOfStockCount = products.filter(p => (p.stock ?? 0) === 0).length;

  const STATS = [
    { icon: 'cube-outline', label: 'TOTAL', value: total, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { icon: 'checkmark-circle-outline', label: 'ACTIVE', value: activeCount, iconBg: '#DCFCE7', iconColor: '#16A34A' },
    { icon: 'eye-off-outline', label: 'HIDDEN', value: hiddenCount, iconBg: '#F1F5F9', iconColor: '#64748B' },
    { icon: 'alert-circle-outline', label: 'OUT OF STOCK', value: outOfStockCount, iconBg: '#FEE2E2', iconColor: '#EF4444' },
  ];

  // Filtered products
  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'Active') return p.is_available && (p.stock ?? 0) > 0;
    if (activeTab === 'Hidden') return !p.is_available;
    if (activeTab === 'Out of Stock') return (p.stock ?? 0) === 0;
    return true;
  });

  // Avatar initials
  const initials = vendor?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Menu actions
  const handleMenu = item => {
    setSelectedProduct(item);
    setMenuVisible(true);
  };

  const handleToggleHidden = async () => {
    if (!selectedProduct) return;
    setMenuVisible(false);
    const { error } = await supabase
      .from('products')
      .update({ is_available: !selectedProduct.is_available })
      .eq('id', selectedProduct.id)
      .eq('vendor_id', vendor?.id);

    if (error) {
      console.log('Error updating product visibility:', error);
      Alert.alert('Could not update product visibility', error.message);
      return;
    }

    fetchProducts();
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setMenuVisible(false); 
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', selectedProduct.id)
      .eq('vendor_id', vendor?.id)
      .select('id');

    if (error) {
      console.log('Error deleting product:', error);
      Alert.alert('Could not delete product', error.message);
      return;
    }

    if (!data?.length) {
      Alert.alert('Could not delete product', 'This product could not be found or you do not have permission to delete it.');
      return;
    }

    fetchProducts();
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('AddProduct', { product: selectedProduct });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSub}>{total} Total Products</Text>
          </View>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#444" />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#AAA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#AAA"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#AAA" />
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {FILTER_TABS.map(tab => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product List */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="cube-outline" size={52} color="#DDD" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySub}>Add your first product with the + button</Text>
          </View>
        ) : (
          <View style={styles.productList}>
            {filtered.map(item => (
              <ProductCard key={item.id} item={item} onMenuPress={handleMenu} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddProduct')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Context Menu Modal */}
      <ProductContextMenu
        visible={menuVisible}
        item={selectedProduct}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onToggleHidden={handleToggleHidden}
        onDelete={handleDelete}
      />

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(item => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                if (item.route && item.route !== 'VendorProducts') {
                  navigation.navigate(item.route);
                }
              }}
            >
              {item.active ? (
                <View style={styles.navActiveIcon}>
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>
              ) : (
                <Ionicons name={item.icon} size={22} color="#999" />
              )}
              <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 20;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 130 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: BG,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 1 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '600', letterSpacing: 0.5 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#111', marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },

  // Tabs
  tabsScroll: { marginBottom: 20 },
  tabsContent: { gap: 8, paddingRight: 4 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#fff' },

  // Product list
  productList: { gap: 12 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, paddingRight: 4 },
  productName: { fontSize: 15, fontWeight: '700', color: '#111' },
  productCategory: { fontSize: 12, color: '#999', marginTop: 2 },
  productPrice: { fontSize: 16, fontWeight: '800', color: PRIMARY, marginTop: 4 },
  productMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  productStock: { fontSize: 12, color: '#777' },
  productMetaDot: { fontSize: 12, color: '#BBB' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  menuBtn: { padding: 4 },

  // Context menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuRowText: { fontSize: 16, color: '#333' },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAEAEA', marginVertical: 4 },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#AAA' },
  emptySub: { fontSize: 13, color: '#BBB', textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  // Bottom Nav (identical to VendorDashboard)
  bottomNavWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  navItem: { alignItems: 'center', gap: 4, minWidth: 56 },
  navActiveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  navLabelActive: { color: PRIMARY, fontWeight: '700' },
});

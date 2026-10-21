import React, { useState, useEffect, useContext, useCallback } from 'react';
import {View,ScrollView,StyleSheet,Pressable,TextInput,Dimensions,ActivityIndicator,Alert,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { AppText as Text } from '../components/CustomText';
import { formatNaira } from '../utils/orders';

// ── Design tokens 
const PRIMARY = '#FF6B00';
const BG = '#F5F5F5';
const CARD = '#FFFFFF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Bottom nav config (Orders tab active)
const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid-outline',      active: false, route: 'VendorDashboard' },
  { label: 'Products',  icon: 'cube-outline',       active: false, route: 'VendorProducts'  },
  { label: 'Orders',    icon: 'receipt-outline',    active: true,  route: 'VendorOrders'    },
  { label: 'Messages',  icon: 'chatbubble-outline', active: false                            },
  { label: 'Profile',   icon: 'person-outline',     active: false                            },
];
 
// ── Order status conf
const STATUS_CONFIG = {
  pending:   { dot: '#FF6B00', label: 'Pending',   bg: '#FFF3EB', color: '#FF6B00' },
  accepted:  { dot: '#3B82F6', label: 'Accepted',  bg: '#EBF3FF', color: '#3B82F6' },
  preparing: { dot: '#8B5CF6', label: 'Preparing', bg: '#F3EBFF', color: '#8B5CF6' },
  ready:     { dot: '#8B5CF6', label: 'Ready',     bg: '#F3EBFF', color: '#8B5CF6' },
  delivered: { dot: '#16A34A', label: 'Completed', bg: '#EBFBF0', color: '#16A34A' },
  cancelled: { dot: '#EF4444', label: 'Cancelled', bg: '#FEEBEB', color: '#EF4444' },
};

// ── Next action per status ────────────────────────────────────────────────────
const NEXT_ACTION = {
  pending:   { label: 'Accept Order',    next: 'accepted'  },
  accepted:  { label: 'Start Preparing', next: 'preparing' },
  preparing: { label: 'Mark Ready',      next: 'ready'     },
  ready:     { label: 'Mark Delivered',  next: 'delivered' },
}; 


// ── Helpers
function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Status Badge 
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={styles.statusBadge}>
      <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── Order Card 
function OrderCard({ order, onAction }) {
  const action = NEXT_ACTION[order.status];
  const canDecline = !!action;
  const shortId = `#${String(order.order_number).padStart(6, '0')}`;

  return (
    <View style={styles.orderCard}>
      {/* Top row */}
      <View style={styles.cardTopRow}>
        <StatusBadge status={order.status} />
        <Text style={styles.orderMeta}>
          Order {shortId} · {timeAgo(order.created_at)}
        </Text>
      </View>

      {/* Customer & items */}
      <Text style={styles.customerName}>{order.customer_name}</Text>
      <Text style={styles.itemsSummary}>{order.items_summary}</Text>

      {/* Bottom row */}
      <View style={styles.cardBottomRow}>
        <Text style={styles.orderTotal}>{formatNaira(order.total)}</Text>
        <View style={styles.actionGroup}>
          {canDecline && (
            <Pressable
              style={({ pressed }) => [
                styles.declineBtn,
                pressed && styles.declineBtnPressed,
              ]}
              onPress={() => onAction(order, 'cancelled')}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </Pressable>
          )}

          {action ? (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
              onPress={() => onAction(order, action.next)}
            >
              <Text style={styles.actionBtnText}>{action.label}</Text>
            </Pressable>
          ) : (
            <View style={styles.completedTag}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.completedText}>Done</Text>
            </View>
          )}
        </View>
      </View> 
    </View>
  );
}

// ── Filter Tab ────────────────────────────────────────────────────────────────
function FilterTab({ label, count, active, onPress }) {
  return (
    <Pressable
      style={[styles.filterTab, active && styles.filterTabActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.filterCount, active && styles.filterCountActive]}>
          <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VendorOrdersScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [vendor, setVendor]       = useState(null);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // ── Fetch vendor ──────────────────────────────────────────────────────────
 useEffect(() => {
  if (!user) return;

  const fetchVendor = async ()=> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return;
    }
    
    console.log ('VENDOR:', data);
    setVendor(data);
  };

  fetchVendor();
}, [user]);


const fetchOrders = useCallback(async () => {
  if (!vendor) return;

  setLoading(true);

  const { data, error } = await supabase
  .from('order_packages')
  .select(`
    *,
    orders (
      *,
      profiles!orders_profiles_fkey (
        first_name,
        last_name
      )
    ),
    order_items (*)
  `)
  .eq('vendor_id', vendor.id)
  .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    setLoading(false);
    return;
  }

    console.log("VENDOR PACKAGES:", data);

    const normalizedOrders = data.map(pkg => ({
      id: pkg.orders?.id,
      order_number: pkg.orders?.order_number,
      package_id: pkg.id,

      customer_name: pkg.orders?.profiles?.first_name?? 'Customer',

      items_summary: (pkg.order_items ?? [])       
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', '),

      total: (pkg.order_items ?? []).reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      ),

      status: pkg.status,
      created_at: pkg.created_at,
    }));

    console.log('NORMALIZED VENDOR ORDERS:', normalizedOrders);

    setOrders(normalizedOrders);
    setLoading(false);
  }, [vendor]);


  // Refresh orders

  useFocusEffect(
    useCallback(() => {
      if (vendor) {
        fetchOrders();
      }
    }, [vendor, fetchOrders])
  );





const handleAction = (order, nextStatus) => {
  const cfg = STATUS_CONFIG[nextStatus];
  const isDecline = nextStatus === 'cancelled';

  Alert.alert(
    isDecline ? 'Decline this order?' : `Move to "${cfg?.label}"?`,
    isDecline
      ? `Order ${order.id} for ${order.customer_name} will be marked as cancelled.`
      : `Update order ${order.id} for ${order.customer_name}.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isDecline ? 'Decline Order' : 'Confirm',
        style: isDecline ? 'destructive' : 'default',
        onPress: async () => {
          // Optimistic local update
          setOrders(prev =>
            prev.map(o => (o.id === order.id ? { ...o, status: nextStatus } : o))
          );

          const { error } = await supabase
            .from('order_packages')
            .update({ status: nextStatus })
            .eq('id', order.package_id);

          if (error) {
            setOrders(prev =>
              prev.map(o => (o.id === order.id ? { ...o, status: order.status } : o))
            );
            Alert.alert('Update failed', 'Unable to update this order status. Please try again.');
          }
        },
      },
    ]
  );
};

  // ── Derived counts & filter ───────────────────────────────────────────────
  const counts = {
    All:       orders.length,
    Pending:   orders.filter(o => o.status === 'pending').length,
    Ongoing:   orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length,
    Completed: orders.filter(o => o.status === 'delivered').length,
  };

  const TABS = ['All', 'Pending', 'Ongoing', 'Completed'];

  const filtered = orders.filter(o => {
    const matchTab =
      activeTab === 'All'       ? true
      : activeTab === 'Pending'   ? o.status === 'pending'
      : activeTab === 'Ongoing'   ? ['accepted', 'preparing', 'ready'].includes(o.status)
      : activeTab === 'Completed' ? o.status === 'delivered'
      : true;

    const q = search.toLowerCase();
    const matchSearch =
      q === '' ||
      o.customer_name.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.items_summary.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const vendorInitials = getInitials(vendor?.name ?? '');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#444" />
            <View style={styles.notifDot} />
          </Pressable>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{vendorInitials}</Text>
          </View>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map(tab => (
          <FilterTab
            key={tab}
            label={tab}
            count={counts[tab]}
            active={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </ScrollView>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#BBB" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          placeholderTextColor="#BBB"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </Pressable>
        )}
      </View>

      {/* ── Order List ── */}
      {loading ? (
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centeredWrap}>
          <Ionicons name="receipt-outline" size={52} color="#DDD" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySub}>
            {search.length > 0
              ? 'Try a different search term'
              : 'New orders will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onAction={handleAction} />
          ))}
          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(item => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                if (item.route && !item.active) navigation.navigate(item.route);
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
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: BG,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: BG,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4C2A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A3010',
  },

  // Filter tabs
  tabsScroll: { flexGrow: 0, backgroundColor: BG },
  tabsContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  filterTabTextActive: { color: '#fff' },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountActive: { backgroundColor: PRIMARY },
  filterCountText: { fontSize: 11, fontWeight: '700', color: '#666' },
  filterCountTextActive: { color: '#fff' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },

  // List
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 12 },

  // Order card
  orderCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: '700' },
  orderMeta: { fontSize: 12, color: '#999', fontWeight: '500' },
  customerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  itemsSummary: {
    fontSize: 13,
    color: '#777',
    marginBottom: 14,
    lineHeight: 18,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTotal: { fontSize: 18, fontWeight: '800', color: '#111' },
  actionBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBFBF0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  completedText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },

  // Empty / loading
  centeredWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#AAA' },
  emptySub: {
    fontSize: 13,
    color: '#CCC',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Bottom nav
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
    backgroundColor: 'rgba(255,255,255,0.97)',
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
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  declineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declineBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
    backgroundColor: '#FEEBEB',
  },
  declineBtnText: { fontSize: 13, fontWeight: '600', color: '#EF4444'
  }
});

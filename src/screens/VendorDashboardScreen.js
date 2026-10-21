import React from 'react';
import {View, ScrollView, StyleSheet, Pressable, Dimensions,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { AppText as Text } from '../components/CustomText';


const PRIMARY = '#FF6B00';
const BG = '#FAFAF9';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid', active: true },
  { label: 'Products', icon: 'cube-outline', active: false, route: 'VendorProducts' },
  { label: 'Orders', icon: 'receipt-outline', active: false, route: 'VendorOrders' },
  { label: 'Messages', icon: 'chatbubble-outline', active: false },
  { label: 'Profile', icon: 'person-outline', active: false },
];

function TrendBadge({ value }) {
  return (
    <View style={styles.trendBadge}>
      <Ionicons name="arrow-up" size={10} color="#16A34A" />
      <Text style={styles.trendText}>{value}</Text>
    </View>
  );
}

function StatCard({ stat }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <View style={[styles.statIconWrap, { backgroundColor: stat.iconBg }]}>
          <Ionicons name={stat.icon} size={18} color={stat.iconColor} />
        </View>
        <TrendBadge value={stat.trend} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );
}

function RevenueChart() {
  return (
    <Svg width="100%" height={48} viewBox="0 0 120 48" preserveAspectRatio="none">
      <Path
        d="M0 40 L15 32 L30 36 L45 24 L60 28 L75 16 L90 20 L105 8 L120 12 L120 48 L0 48 Z"
        fill={PRIMARY}
        opacity={0.15}
      />
      <Path
        d="M0 40 L15 32 L30 36 L45 24 L60 28 L75 16 L90 20 L105 8 L120 12"
        stroke={PRIMARY}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

function OrdersChart() {
  const bars = [18, 28, 22, 36, 30, 42, 38];
  return (
    <Svg width="100%" height={48} viewBox="0 0 120 48">
      {bars.map((h, i) => (
        <Rect
          key={i}
          x={i * 17 + 4}
          y={48 - h}
          width={10}
          height={h}
          rx={3}
          fill="#3B82F6"
          opacity={0.7 + i * 0.04}
        />
      ))}
    </Svg>
  );
}

function OrderStatusBadge({ status, variant }) {
  const stylesByVariant = {
    preparing: { bg: '#FFF0E8', color: PRIMARY },
    ready: { bg: '#FFF0E8', color: PRIMARY },
    delivered: { bg: '#DCFCE7', color: '#16A34A' },
  };
  const { bg, color } = stylesByVariant[variant] || stylesByVariant.preparing;

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
}


const STATUS_VARIIANT = {
  pending : 'preparing',
  accepted: 'preparing',
  preparing: 'preparing',
  ready: 'ready',
  delivered: 'delivered',
  cancelled: 'preparing',
};

function normalizeRecentOrder(pkg) {
  const profile = pkg.orders?.profiles;
  const customerName = profile?.first_name || 'Customer';
  const initials = customerName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

    const itemSummary = (pkg.order_items ?? [])
    .map(item => `${item.quantity} x ${item.name}`)
    .join(', ');

    return {
      id: pkg.id,
      avatarBg: '#FFF0E8',
      initials,
      name: customerName,
      items: itemSummary,
      price: `₦${Number(pkg.subtotal?? 0).toLocaleString()}`,
      orderedAt: pkg.created_at
        ? `${new Date(pkg.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(pkg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : '',
      status: pkg.status,
      statusStyle: STATUS_VARIIANT[pkg.status] || 'preparing',
    };
}

export default function VendorDashboardScreen() {

 
  
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
 
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    totalProducts: 0,
    averageRating: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);


   const dashboardStats = [
  {
    label: "Today's Revenue",
    value: `₦${stats.totalRevenue.toLocaleString()}`,
    icon: 'cash-outline',
    iconBg: '#E8F4FD',
    iconColor: '#3B82F6',
  },

  {
    label: 'Orders Today',
    value: stats.ordersToday.toString(),
    icon: 'bag-handle-outline',
    iconBg: '#FFF0E8',
    iconColor: '#EF4444',
  },

  {
    label: 'Total Products',
    value: stats.totalProducts.toString(),
    icon: 'cube-outline',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
  },

  {
    label: 'Average Rating',
    value: stats.averageRating.toString(),
    icon: 'star',
    iconBg: '#FEF9C3',
    iconColor: '#EAB308',
  },
];

  const initials = vendor?.name
    ?.split(" ")
    .map(word => word [0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fetchVendor = async () => {

    try {
      if (!user?.id) return null;

      const {data, error} = await supabase
        .from( "vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

        if(error) {
          console.log(error);
          return;
        }

        setVendor(data);

        return data;
    }  catch (error) {
        console.log("Error fetching vendor:", error);
        return null;
      }  
  };

  //Fetch total products count for the vendor

  const fetchTotalProducts = async (vendorId) => {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId);

    if (error) {
      console.log("Error fetching total products:", error);
      return 0;
    }

    return count || 0;
  };

  // Fetch low stock products data for the vendor

  const fetchLowStock = async (vendorId) => {
    const { data,error } = await supabase
    .from ("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .lt("stock", 5)
    .order("stock", { ascending: true });

    if (error) {
      console.log("Error fetching low stock products:", error);
      return [];
    }

    return data || [];
  };
  
  // Fetch recent orders for the vendor
    
  const fetchRecentOrders = async (vendorId) => {
    const { data, error } = await supabase
      .from("order_packages")
      .select(`
        *,
        orders (
          *,
          profiles!orders_profiles_fkey (
            first_name,
            last_name
          )
        ),
        order_items (
          *
        )
      `)
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log("RECENT ORDERS ERROR:", error);
      return [];
    }

    console.log("RECENT ORDERS:", data);

    return data || [];
  };

  //fetch total revenue and orders today for the vendor

  const fetchTodayStats = async (vendorId) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const { data, error} = await supabase
      .from ('order_packages')
      .select('id, status, subtotal')
      .eq('vendor_id', vendorId)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay);

      if (error) {
        console.log( "Error fetching today's stats:", error);
        return { totalRevenue: 0, ordersToday: 0 };
      }

      const packages = data || [];

      const totalRevenue = packages
        .filter(pkg => pkg.status === 'delivered')
        .reduce ((sum, pkg) => sum + Number(pkg.subtotal), 0);

        return { totalRevenue, ordersToday: packages.length };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const vendorData = await fetchVendor();
      
      if (!vendorData) {
        setLoading(false);
        return;
      }

      const vendorId = vendorData.id;

      const [ totalProducts, lowStockProducts, recentVendorsOrders, todayStats] = await Promise.all([
        fetchTotalProducts(vendorId),
        fetchLowStock(vendorId),
        fetchRecentOrders(vendorId),
        fetchTodayStats(vendorId),
      ]);

      setLowStock(lowStockProducts);
      setRecentOrders(recentVendorsOrders.map(normalizeRecentOrder));

      setStats ({
      
        totalRevenue: todayStats.totalRevenue,
        ordersToday: todayStats.ordersToday,
        totalProducts: totalProducts,
        averageRating: 0,
      });
    
    } catch (error) {
      console.log("Error fetching dashboard data:", error);  

    } finally {
      setLoading(false);
    }   
  }; 





  useEffect(() => {

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={styles.vendorName}>{vendor?.name}</Text>
            </View>
          </View>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#444" />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </View>



        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Pressable>
            <Text style={styles.sectionLink}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.cardList}>
          {recentOrders.map((order) => (
            <Pressable key={order.id} style={styles.orderCard}>
              <View style={[styles.orderAvatar, { backgroundColor: order.avatarBg }]}>
                <Text style={styles.orderAvatarText}>{order.initials}</Text>
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderItems}>{order.items}</Text>
                <Text style={styles.orderItems}>{order.orderedAt}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderPrice}>{order.price}</Text>
                <OrderStatusBadge status={order.status} variant={order.statusStyle} />
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" style={styles.chevron} />
            </Pressable>
          ))}
        </View>

        {/* Low Stock */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Low Stock</Text>
          <Pressable>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.lowStockCard}>
          {lowStock.map((item, index) => (
            <View
              key={item.id}
              style={[styles.lowStockRow, index < lowStock.length - 1 && styles.lowStockBorder]}
            >
              <View style={[styles.lowStockIcon, { backgroundColor: '#FFF0E8' }]}>
                <Ionicons name="cube-outline" size={18} color={PRIMARY} />
              </View>
              <View style={styles.lowStockInfo}>
                <Text style={styles.lowStockName}>{item.name}</Text>
                <View style={styles.lowStockWarning}>
                  <Ionicons name="warning-outline" size={12} color={PRIMARY} />
                  <Text style={styles.lowStockLeft}>Only {item.stock ?? 0} left</Text>
                </View>
              </View>
              <Pressable style={styles.restockBtn}>
                <Text style={styles.restockBtnText}>Restock</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Product Button */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                if (item.route) navigation.navigate(item.route);
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

const CARD_RADIUS = 20;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
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
    marginTop: 8,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 13,
    color: '#888',
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginTop: 2,
  },
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

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
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
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionLink: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },

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

  cardList: {
    gap: 10,
    marginBottom: 20,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  orderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  orderItems: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 2,
  },

  lowStockCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  lowStockBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  lowStockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  lowStockLeft: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },
  restockBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  restockBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  performanceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  performanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    flex: 1,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  performanceTrend: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  chartWrap: {
    marginHorizontal: -8,
    marginBottom: -8,
  },

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
  navItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  navActiveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  navLabelActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
});

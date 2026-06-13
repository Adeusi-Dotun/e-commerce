import { AppText as Text } from '../components/CustomText';
import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { OrderContext } from '../context/OrderContext';
import {
  formatNaira,
  computeItemsCountFromPackages,
  buildOrderPreviewFromPackages,
} from '../utils/orders';

const BG_COLOR = '#FAFAFA';
const CARD_COLOR = '#FFFFFF';
const TEXT_MAIN = '#111111';
const TEXT_MUTED = '#666666';
const TEXT_LIGHT = '#999999';
const BORDER_COLOR = '#EAEAEA';

const STATUS_COLORS = {
  Ongoing: { dot: '#F59E0B', bg: '#FEF3C7', text: '#D97706' },
  Completed: { dot: '#10B981', bg: '#D1FAE5', text: '#059669' },
  Cancelled: { dot: '#EF4444', bg: '#FEE2E2', text: '#DC2626' },
};

// formatNaira, computeItemsCountFromPackages, buildOrderPreviewFromPackages
// are imported from utils/orders.

const normalizeOrder = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const packages = Array.isArray(raw.packages) ? raw.packages : undefined;
  const status = raw.status || 'Ongoing';

  const vendors =
    raw.vendors !== undefined && raw.vendors !== null
      ? Number(raw.vendors)
      : packages
        ? packages.length
        : 0;

  const items =
    raw.items !== undefined && raw.items !== null
      ? Number(raw.items)
      : packages
        ? computeItemsCountFromPackages(packages)
        : 0;

  const preview =
    typeof raw.preview === 'string' && raw.preview.trim().length > 0
      ? raw.preview
      : packages
        ? buildOrderPreviewFromPackages(packages)
        : 'Your order';

  return {
    ...raw,
    id: raw.id || raw.orderId || '',
    status,
    vendors,
    items,
    preview,
    date: raw.date || raw.orderDate || 'Just now',
    total: raw.total ?? raw.totalPaid ?? 0,
    packages: packages || [],
    estimatedDelivery: raw.estimatedDelivery,
    driverName: raw.driverName,
  };
};

const MyOrdersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orders: contextOrders = [] } = useContext(OrderContext);
  const [activeTab, setActiveTab] = useState('Ongoing');

  const incomingOrders = route.params?.orders
    ? route.params.orders
    : route.params?.order
      ? [route.params.order]
      : [];

  const orders = useMemo(() => {
    const allRawOrders = [
      ...(Array.isArray(contextOrders) ? contextOrders : []),
      ...(Array.isArray(incomingOrders) ? incomingOrders : []),
    ];

    const uniqueById = [];
    const seen = new Set();

    allRawOrders.forEach((rawOrder) => {
      const normalized = normalizeOrder(rawOrder);
      if (!normalized || !normalized.id || seen.has(normalized.id)) return;
      seen.add(normalized.id);
      uniqueById.push(normalized);
    });

    return uniqueById;
  }, [contextOrders, incomingOrders]);

  const filteredOrders = orders.filter((o) => o.status === activeTab);
  const activeCount = orders.filter((o) => o.status === 'Ongoing').length;
  const deliveredCount = orders.filter((o) => o.status === 'Completed').length;
  const issuesCount = orders.filter((o) => o.status === 'Cancelled').length;

  const getStatusCTA = (status) => {
    switch (status) {
      case 'Ongoing': return 'Track Order';
      case 'Completed': return 'View Summary';
      case 'Cancelled': return 'View Issue';
      default: return 'Details';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={TEXT_MAIN} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>Track and manage all your purchases</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="options-outline" size={20} color={TEXT_MAIN} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <Text style={styles.statValue}>{activeCount}</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
            <Text style={styles.statValue}>{deliveredCount}</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.statLabel}>Issues</Text>
            </View>
            <Text style={styles.statValue}>{issuesCount}</Text>
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabsContainer}>
          {['Ongoing', 'Completed', 'Cancelled'].map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status].bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[order.status].dot }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status].text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="storefront-outline" size={13} color={TEXT_MUTED} />
                    <Text style={styles.metaText}>{order.vendors} vendor{order.vendors > 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.metaItem}>
                    <Ionicons name="cube-outline" size={13} color={TEXT_MUTED} />
                    <Text style={styles.metaText}>{order.items} item{order.items > 1 ? 's' : ''}</Text>
                  </View>
                </View>

                <Text style={styles.orderPreview} numberOfLines={1}>{order.preview}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>

                <View style={styles.divider} />

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
                  </View>
                  <Pressable
                    style={styles.ctaBtn}
                    onPress={() => navigation.navigate('TrackOrder', { order })}
                  >
                    <Text style={styles.ctaText}>{getStatusCTA(order.status)}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFF" style={{marginLeft: 4}} />
                  </Pressable>
                </View>

              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CARD_COLOR,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD_COLOR,
  },
  iconBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_MAIN,
  },
  headerSubtitle: {
    fontSize: 11,
    color: TEXT_LIGHT,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: BG_COLOR,
    flexGrow: 1,
  },
  statsStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: CARD_COLOR,
  },
  statBox: {
    flex: 1,
    backgroundColor: CARD_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_MAIN,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabBtnActive: {
    backgroundColor: CARD_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  tabTextActive: {
    color: TEXT_MAIN,
  },
  ordersList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MAIN,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  metaDot: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginHorizontal: 8,
  },
  orderPreview: {
    fontSize: 13,
    color: TEXT_MAIN,
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 12,
    color: TEXT_LIGHT,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: TEXT_LIGHT,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_MAIN,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

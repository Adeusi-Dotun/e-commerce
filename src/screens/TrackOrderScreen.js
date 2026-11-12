import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppText as Text } from '../components/CustomText';
import { formatNaira } from '../utils/orders';
import { supabase } from '../lib/supabase';

/* ────────────────────────────────────────────────────────────────────────────
 * Tokens. Change BRAND once and the whole screen follows.
 * ──────────────────────────────────────────────────────────────────────────── */
const BRAND = '#A83B10'; // swap for whichever orange you standardise on
const BRAND_SOFT = 'rgba(168, 59, 16, 0.09)';
const BRAND_RING = 'rgba(168, 59, 16, 0.18)';
const BG = '#F6F5F3';
const CARD = '#FFFFFF';
const TEXT = '#161412';
const TEXT_MUTED = '#6B645D';
const TEXT_LIGHT = '#A39C94';
const LINE = '#E4E0DA';
const DANGER = '#B3261E';
const DANGER_SOFT = 'rgba(179, 38, 30, 0.08)';

/* ────────────────────────────────────────────────────────────────────────────
 * Status model. Keys match order_packages.status in the database, so wiring
 * realtime later only changes where `status` comes from.
 * ──────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  { key: 'pending', title: 'Order placed', detail: 'Your order was sent to the vendor' },
  { key: 'accepted', title: 'Order accepted', detail: 'The vendor confirmed your order' },
  { key: 'preparing', title: 'Preparing', detail: 'Your order is being made' },
  { key: 'ready', title: 'Ready', detail: 'Your order is ready' },
  { key: 'delivered', title: 'Delivered', detail: 'Your order has arrived' },
];

const STEP_KEYS = STEPS.map((s) => s.key);

const BANNERS = {
  pending: { icon: 'hourglass-outline', text: (v) => `Waiting for ${v} to accept your order` },
  accepted: { icon: 'checkmark-circle-outline', text: (v) => `${v} accepted your order` },
  preparing: { icon: 'restaurant-outline', text: () => 'Your order is being prepared' },
  ready: { icon: 'bag-check-outline', text: () => 'Your order is ready' },
  delivered: { icon: 'happy-outline', text: () => 'Your order has been delivered' },
  cancelled: { icon: 'close-circle-outline', text: () => 'This order was cancelled' },
};

// Accepts DB values plus the older labels the app used before.
const normalizeStatus = (raw) => {
  const value = String(raw || '').trim().toLowerCase();
  if (STEP_KEYS.includes(value) || value === 'cancelled') return value;

  const legacy = {
    'order confirmed': 'pending',
    'payment received': 'accepted',
    'vendor preparing': 'preparing',
    'out for delivery': 'ready',
    completed: 'delivered',
    ongoing: 'pending',
  };
  return legacy[value] || 'pending';
};

const formatTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
};

const statusLabel = (key) =>
  key === 'cancelled'
    ? 'Cancelled'
    : STEPS.find((s) => s.key === normalizeStatus(key))?.title || 'Order placed';

/* ────────────────────────────────────────────────────────────────────────────
 * Data layer
 * mapOrder is the ONE place that knows your column names. If a field shows up
 * empty on screen, fix its name here and nowhere else.
 * ──────────────────────────────────────────────────────────────────────────── */
// The order's delivery_address column is text. Checkout saves the address
// object as a JSON string, so parse it before reading fields.
const formatDeliveryAddress = (raw) => {
  if (!raw) return '';

  let addr = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{')) return trimmed; // already plain text
    try {
      addr = JSON.parse(trimmed);
    } catch (e) {
      return '';
    }
  }
  if (typeof addr !== 'object') return '';

  const line =
    addr.addressLine ??
    addr.address_line ??
    addr.locationName ??
    addr.address ??
    addr.name ??
    '';
  return [line, addr.landmark].filter(Boolean).join(' \u00B7 ');
};

const mapOrder = (raw) => {
  const packages = (raw.order_packages || []).map((pkg) => ({
    id: pkg.id,
    vendorId: pkg.vendor_id,
    vendorName: pkg.vendors?.business_name || pkg.vendors?.name || 'Vendor', // CHECK column
    vendorLocation: pkg.vendors?.campus_location || pkg.vendors?.address || '', // CHECK column
    status: pkg.status,
    items: (pkg.order_items || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  }));

  return {
    id: raw.id,
    orderNumber: raw.order_number,
    total: raw.total ?? raw.total_paid ?? 0, // CHECK column
    deliveryAddress: formatDeliveryAddress(raw.delivery_address ?? raw.address),
    timestamps: { pending: raw.created_at },
    packages,
  };
};

const EMPTY_ORDER = { id: '', packages: [], timestamps: {}, total: 0 };

// Fetch once, then listen for status changes on this order's packages.
const useTrackedOrder = (orderId) => {
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    (async () => {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_packages (
            *,
            vendors (*),
            order_items (*)
          )
        `
        )
        .eq('id', orderId)
        .single();

      if (!active) return;
      if (fetchError || !data) setError(fetchError || new Error('Order not found'));
      else setOrder(mapOrder(data));
      setLoading(false);
    })();

    const channel = supabase
      .channel(`track-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_packages',
          filter: `order_id=eq.${orderId}`, // CHECK: FK column name on order_packages
        },
        (payload) => {
          setOrder((prev) => ({
            ...prev,
            packages: prev.packages.map((pkg) =>
              pkg.id === payload.new.id ? { ...pkg, status: payload.new.status } : pkg
            ),
          }));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, loading, error };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Pieces
 * ──────────────────────────────────────────────────────────────────────────── */
const PulseRing = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.9,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pulseRing, { opacity, transform: [{ scale }] }]}
    />
  );
};

const StatusBanner = ({ status, vendorName }) => {
  const banner = BANNERS[status];
  const cancelled = status === 'cancelled';

  return (
    <View style={[styles.banner, cancelled && { backgroundColor: DANGER_SOFT }]}>
      <View style={[styles.bannerIcon, cancelled && { backgroundColor: DANGER }]}>
        <Ionicons name={banner.icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.bannerText}>{banner.text(vendorName)}</Text>
    </View>
  );
};

const RouteCard = ({ vendorName, vendorLocation, deliveryAddress }) => (
  <View style={styles.card}>
    <View style={styles.routeRow}>
      <View style={styles.routeRail}>
        <View style={[styles.routeDot, { backgroundColor: BRAND }]} />
        <View style={styles.routeConnector} />
      </View>
      <View style={styles.routeBody}>
        <Text style={styles.routeLabel}>Pick up from</Text>
        <Text style={styles.routeTitle} numberOfLines={1}>
          {vendorName}
        </Text>
        {vendorLocation ? (
          <Text style={styles.routeDetail} numberOfLines={2}>
            {vendorLocation}
          </Text>
        ) : null}
      </View>
    </View>

    <View style={styles.routeRow}>
      <View style={styles.routeRail}>
        <View style={[styles.routeDot, styles.routeDotHollow]} />
      </View>
      <View style={styles.routeBody}>
        <Text style={styles.routeLabel}>Deliver to</Text>
        <Text style={styles.routeDetailStrong} numberOfLines={2}>
          {deliveryAddress || 'No address provided'}
        </Text>
      </View>
    </View>
  </View>
);

const TimelineRow = ({ step, state, time, isLast }) => {
  const done = state === 'done';
  const current = state === 'current';
  const pending = state === 'pending';

  return (
    <View style={styles.tlRow}>
      <View style={styles.tlRail}>
        <View style={styles.tlDotWrap}>
          {current ? <PulseRing /> : null}
          <View
            style={[
              styles.tlDot,
              (done || current) && styles.tlDotFilled,
              current && styles.tlDotCurrent,
              pending && styles.tlDotPending,
            ]}
          >
            {done ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
            {current ? <View style={styles.tlDotCore} /> : null}
          </View>
        </View>
        {!isLast ? (
          <View style={[styles.tlLine, done && styles.tlLineDone]} />
        ) : null}
      </View>

      <View style={styles.tlBody}>
        <Text style={[styles.tlTitle, pending && { color: TEXT_LIGHT }]}>
          {step.title}
        </Text>
        <Text style={[styles.tlDetail, pending && { color: TEXT_LIGHT }]}>
          {step.detail}
        </Text>
      </View>

      {time ? <Text style={styles.tlTime}>{time}</Text> : null}
    </View>
  );
};

const Timeline = ({ status, timestamps }) => {
  const activeIndex = STEP_KEYS.indexOf(status);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Order progress</Text>
      {STEPS.map((step, index) => {
        let state = 'pending';
        if (index < activeIndex) state = 'done';
        else if (index === activeIndex) state = status === 'delivered' ? 'done' : 'current';

        return (
          <TimelineRow
            key={step.key}
            step={step}
            state={state}
            time={state === 'pending' ? null : formatTime(timestamps?.[step.key])}
            isLast={index === STEPS.length - 1}
          />
        );
      })}
    </View>
  );
};

const CancelledCard = ({ time }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Order cancelled</Text>
    <Text style={styles.cancelledBody}>
      This order was cancelled{time ? ` at ${time}` : ''}. If you were charged, the
      refund will go back to your original payment method.
    </Text>
  </View>
);

const SummaryCard = ({ packages, total }) => (
  <View style={styles.card}>
    <View style={styles.summaryHeader}>
      <Text style={styles.sectionTitleInline}>Your order</Text>
      <Text style={styles.summaryTotal}>{formatNaira(total)}</Text>
    </View>

    {packages.length === 0 ? (
      <Text style={styles.routeDetail}>Order details will show here.</Text>
    ) : (
      packages.map((pkg, pIndex) => (
        <View key={pkg.vendorId || pkg.vendorName || pIndex} style={styles.pkg}>
          {packages.length > 1 ? (
            <Text style={styles.pkgVendor}>
              {pkg.vendorName}: {statusLabel(pkg.status)}
            </Text>
          ) : null}
          {(pkg.items || []).map((item, iIndex) => (
            <View key={item.id || iIndex} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity || 1}×</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {typeof item.price === 'number' ? (
                <Text style={styles.itemPrice}>
                  {formatNaira(item.price * (item.quantity || 1))}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ))
    )}
  </View>
);

/* ────────────────────────────────────────────────────────────────────────────
 * Screen
 * ──────────────────────────────────────────────────────────────────────────── */
const TrackOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = route.params?.orderId ?? route.params?.order?.id;
  const { order, loading, error } = useTrackedOrder(orderId);

  const packages = order.packages;
  const firstPackage = packages[0] || {};
  // Main timeline follows the first package. Multi-vendor orders list each
  // vendor's own status in the summary card.
  const status = normalizeStatus(firstPackage.status);
  const vendorName = order.vendorName || firstPackage.vendorName || 'the vendor';
  const vendorLocation = order.vendorLocation || firstPackage.vendorLocation || '';
  const deliveryAddress =
    typeof order.deliveryAddress === 'string'
      ? order.deliveryAddress
      : order.deliveryAddress?.address || order.address || '';
  const timestamps = order.timestamps || {};
  const total = order.total ?? order.totalPaid ?? 0;
  const canCancel = status === 'pending';

  const orderLabel = useMemo(() => {
    if (order.orderNumber != null) {
      return `Order #${String(order.orderNumber).padStart(6, '0')}`;
    }
    const id = String(order.id || '');
    return id ? `Order #${id.slice(-6).toUpperCase()}` : 'Your order';
  }, [order.id, order.orderNumber]);

  const handleCancel = () => {
    // TODO: call your cancel flow here (update order_packages.status to 'cancelled')
  };

  const handleSupport = () => {
    // TODO: open support (Contact Support screen or WhatsApp link)
  };

  if (loading || error || !order.id) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </Pressable>
        </View>
        <View style={styles.centerState}>
          {loading ? (
            <ActivityIndicator color={BRAND} />
          ) : (
            <Text style={styles.centerText}>
              We couldn't load this order. Go back and try again.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Track order</Text>
          <Text style={styles.headerSub}>{orderLabel}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <StatusBanner status={status} vendorName={vendorName} />

        <RouteCard
          vendorName={vendorName}
          vendorLocation={vendorLocation}
          deliveryAddress={deliveryAddress}
        />

        {status === 'cancelled' ? (
          <CancelledCard time={formatTime(timestamps.cancelled)} />
        ) : (
          <Timeline status={status} timestamps={timestamps} />
        )}

        <SummaryCard packages={packages} total={total} />

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={handleSupport}>
            <Ionicons name="headset-outline" size={19} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Contact support</Text>
          </Pressable>

          {canCancel ? (
            <Pressable style={styles.ghostBtn} onPress={handleCancel}>
              <Text style={styles.ghostBtnText}>Cancel order</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackOrderScreen;

/* ────────────────────────────────────────────────────────────────────────────
 * Styles
 * ──────────────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  headerSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },

  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(22, 20, 18, 0.06)',
  },

  /* Banner */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: BRAND_SOFT,
    borderRadius: 16,
    padding: 16,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1, fontSize: 17, fontWeight: '700', color: TEXT, lineHeight: 23 },

  /* Route card */
  routeRow: { flexDirection: 'row', gap: 14 },
  routeRail: { width: 14, alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeDotHollow: { borderWidth: 2.5, borderColor: BRAND, backgroundColor: CARD },
  routeConnector: { flex: 1, width: 2, backgroundColor: LINE, marginVertical: 4 },
  routeBody: { flex: 1, paddingBottom: 18 },
  routeLabel: { fontSize: 13, color: TEXT_MUTED },
  routeTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginTop: 3 },
  routeDetail: { fontSize: 14, color: TEXT_MUTED, marginTop: 3, lineHeight: 20 },
  routeDetailStrong: { fontSize: 15, fontWeight: '600', color: TEXT, marginTop: 3, lineHeight: 21 },

  /* Timeline */
  sectionTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 18 },
  sectionTitleInline: { fontSize: 17, fontWeight: '700', color: TEXT },
  tlRow: { flexDirection: 'row', minHeight: 72 },
  tlRail: { width: 30, alignItems: 'center' },
  tlDotWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlDotFilled: { backgroundColor: BRAND },
  tlDotCurrent: { borderWidth: 4, borderColor: BRAND_RING, width: 26, height: 26, borderRadius: 13 },
  tlDotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  tlDotPending: { backgroundColor: CARD, borderWidth: 2, borderColor: LINE },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND_RING,
  },
  tlLine: { flex: 1, width: 2, backgroundColor: LINE, marginVertical: 4 },
  tlLineDone: { backgroundColor: BRAND },
  tlBody: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  tlTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  tlDetail: { fontSize: 14, color: TEXT_MUTED, marginTop: 3, lineHeight: 20 },
  tlTime: { fontSize: 13, color: TEXT_MUTED, paddingTop: 2 },

  cancelledBody: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },

  /* Summary */
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryTotal: { fontSize: 17, fontWeight: '700', color: TEXT },
  pkg: { gap: 10, marginTop: 4, marginBottom: 6 },
  pkgVendor: { fontSize: 14, fontWeight: '700', color: BRAND },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty: { width: 28, fontSize: 14, fontWeight: '600', color: TEXT_MUTED },
  itemName: { flex: 1, fontSize: 15, color: TEXT },
  itemPrice: { fontSize: 14, color: TEXT_MUTED },

  /* Actions */
  actions: { gap: 10, marginTop: 6 },
  primaryBtn: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: BRAND,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  ghostBtn: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: DANGER },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center' },
});
import { AppText as Text } from '../components/CustomText';
import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const BG = '#F3F3F3';
const CARD = '#FFFFFF';
const TEXT = '#111111';
const TEXT_MUTED = '#5E5651';
const TEXT_LIGHT = '#9A948C';
const BORDER = 'rgba(17, 17, 17, 0.08)';
const PRIMARY = '#B53B18';
const ORANGE = '#FF5A00';
const BLUE = '#0057D9';
const BLUE_SOFT = 'rgba(0, 87, 217, 0.09)';
const ORANGE_SOFT = 'rgba(255, 90, 0, 0.12)';
const SHADOW = 'rgba(17, 17, 17, 0.08)';

const fallbackOrder = {
  id: 'ORD-2026-X8Y9',
  status: 'Ongoing',
  vendors: 3,
  items: 5,
  total: 162250,
  packages: [],
};

const formatNaira = (amount) =>
  `\u20A6${Number(amount || 0).toLocaleString('en-NG', {
    maximumFractionDigits: 0,
  })}`;

const flattenItems = (packages = []) =>
  packages.flatMap((vendor) =>
    Array.isArray(vendor?.items)
      ? vendor.items.map((item) => ({
          ...item,
          vendorName: vendor.vendorName,
        }))
      : []
  );

const computeItemsCountFromPackages = (packages = []) =>
  flattenItems(packages).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 1),
    0
  );

const getStatusMeta = (status = 'Ongoing') => {
  switch (status) {
    case 'Completed':
      return {
        label: 'Delivered',
        tone: '#2D6A4F',
        bg: 'rgba(45, 106, 79, 0.1)',
        border: 'rgba(45, 106, 79, 0.18)',
      };
    case 'Cancelled':
      return {
        label: 'Issue Open',
        tone: '#C0392B',
        bg: 'rgba(192, 57, 43, 0.1)',
        border: 'rgba(192, 57, 43, 0.18)',
      };
    default:
      return {
        label: 'In Transit',
        tone: PRIMARY,
        bg: ORANGE_SOFT,
        border: 'rgba(255, 90, 0, 0.22)',
      };
  }
};

const getDeliveryText = (order) => {
  if (typeof order?.estimatedDelivery === 'string') {
    return order.estimatedDelivery;
  }

  if (order?.estimatedDelivery?.to) {
    return order.estimatedDelivery.to;
  }

  if (order?.estimatedDelivery?.from) {
    return order.estimatedDelivery.from;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `Tomorrow, ${date}`;
};

const getOrderSummary = (order) => {
  const packages = Array.isArray(order?.packages) ? order.packages : [];
  const items = flattenItems(packages);
  const vendorCount =
    Number(order?.vendors) || (packages.length > 0 ? packages.length : 0);
  const itemCount =
    Number(order?.items) ||
    (packages.length > 0 ? computeItemsCountFromPackages(packages) : 0);

  return {
    packages,
    items,
    vendorCount: vendorCount || fallbackOrder.vendors,
    itemCount: itemCount || fallbackOrder.items,
    total: order?.total ?? order?.totalPaid ?? fallbackOrder.total,
  };
};

const buildTimeline = (status) => {
  const isDelivered = status === 'Completed';
  const isCancelled = status === 'Cancelled';

  return [
    {
      title: 'Order Confirmed',
      detail: 'Oct 22, 09:41 AM',
      state: 'done',
      icon: 'checkmark',
    },
    {
      title: 'Payment Received',
      detail: 'Oct 22, 09:45 AM',
      state: 'done',
      icon: 'checkmark',
    },
    {
      title: 'Vendor Preparing',
      detail: 'Oct 23, 11:20 AM',
      state: isCancelled ? 'done' : 'done',
      icon: 'checkmark',
    },
    {
      title: isCancelled ? 'Delivery Paused' : 'Out for Delivery',
      detail: isCancelled
        ? 'Support is reviewing this order.'
        : 'Package left facility in Lekki.',
      meta: isCancelled ? 'Pending support update' : 'Oct 23, 02:15 PM',
      state: isDelivered ? 'done' : isCancelled ? 'alert' : 'current',
      icon: isDelivered ? 'checkmark' : isCancelled ? 'alert' : 'bus',
    },
    {
      title: 'Delivered',
      detail: isDelivered ? 'Package delivered successfully.' : 'Pending',
      state: isDelivered ? 'done' : 'pending',
      icon: isDelivered ? 'checkmark' : null,
    },
  ];
};

const SurfaceCard = ({ children, style }) => (
  <View style={[styles.surfaceCard, style]}>{children}</View>
);

const MapPreview = ({ driverName }) => (
  <View style={styles.mapCard}>
    <Svg style={styles.mapSvg} viewBox="0 0 360 220">
      <Defs>
        <LinearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#243837" />
          <Stop offset="0.55" stopColor="#60716F" />
          <Stop offset="1" stopColor="#C6CBC4" />
        </LinearGradient>
      </Defs>
      <Rect width="360" height="220" rx="8" fill="url(#mapBg)" />
      <G opacity="0.22" stroke="#FFFFFF" strokeWidth="1">
        <Line x1="28" y1="14" x2="28" y2="208" />
        <Line x1="72" y1="10" x2="72" y2="206" />
        <Line x1="118" y1="12" x2="118" y2="216" />
        <Line x1="164" y1="0" x2="164" y2="220" />
        <Line x1="212" y1="12" x2="212" y2="218" />
        <Line x1="266" y1="4" x2="266" y2="220" />
        <Line x1="316" y1="0" x2="316" y2="214" />
        <Line x1="6" y1="38" x2="354" y2="38" />
        <Line x1="0" y1="78" x2="360" y2="78" />
        <Line x1="12" y1="116" x2="348" y2="116" />
        <Line x1="0" y1="154" x2="352" y2="154" />
        <Line x1="18" y1="192" x2="360" y2="192" />
      </G>
      <G opacity="0.26" stroke="#E8F0EA" strokeWidth="2" fill="none">
        <Path d="M18 178 C70 150, 96 154, 126 128 S198 78, 250 90 S318 90, 344 54" />
        <Path d="M44 32 C92 48, 105 66, 142 64 S215 42, 304 28" />
        <Path d="M62 206 C88 170, 115 166, 150 170 S242 198, 324 138" />
      </G>
      <Path
        d="M108 42 L108 92 L172 92 L172 132 L222 132 L222 164 L276 164 L276 124 L324 124"
        fill="none"
        stroke="#FF7A1A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="108" cy="42" r="6" fill="#FF7A1A" />
      <Circle cx="324" cy="124" r="9" fill="#FF5A00" />
      <Circle cx="324" cy="124" r="15" stroke="#FF5A00" strokeWidth="2" opacity="0.28" />
    </Svg>

    <View style={styles.mapShade} />

    <View style={styles.driverCard}>
      <View style={styles.driverIcon}>
        <Ionicons name="bicycle" size={22} color={PRIMARY} />
      </View>
      <View style={styles.driverBody}>
        <Text style={styles.driverLabel}>DRIVER</Text>
        <Text style={styles.driverName} numberOfLines={1}>
          {driverName}
        </Text>
      </View>
    </View>
  </View>
);

const EstimateCard = ({ deliveryText }) => (
  <SurfaceCard style={styles.estimateCard}>
    <View style={styles.estimateIcon}>
      <Ionicons name="calendar-clear-outline" size={24} color={BLUE} />
    </View>
    <View style={styles.estimateBody}>
      <Text style={styles.estimateLabel}>ESTIMATED DELIVERY</Text>
      <Text style={styles.estimateText}>{deliveryText}</Text>
    </View>
  </SurfaceCard>
);

const TimelineStep = ({ step, isLast }) => {
  const isDone = step.state === 'done';
  const isCurrent = step.state === 'current';
  const isAlert = step.state === 'alert';
  const isPending = step.state === 'pending';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            isDone && styles.timelineDotDone,
            isCurrent && styles.timelineDotCurrent,
            isAlert && styles.timelineDotAlert,
            isPending && styles.timelineDotPending,
          ]}
        >
          {step.icon ? (
            <Ionicons
              name={step.icon}
              size={isCurrent ? 16 : 15}
              color={isPending ? TEXT_LIGHT : '#FFFFFF'}
            />
          ) : null}
        </View>
        {!isLast ? (
          <View
            style={[
              styles.timelineLine,
              isPending ? styles.timelineLineMuted : styles.timelineLineActive,
            ]}
          />
        ) : null}
      </View>

      <View style={styles.timelineBody}>
        <Text
          style={[
            styles.timelineTitle,
            isCurrent && styles.timelineTitleCurrent,
            isPending && styles.timelineTitlePending,
          ]}
        >
          {step.title}
        </Text>
        <Text
          style={[
            styles.timelineDetail,
            isPending && styles.timelineDetailPending,
          ]}
        >
          {step.detail}
        </Text>
        {step.meta ? <Text style={styles.timelineMeta}>{step.meta}</Text> : null}
      </View>
    </View>
  );
};

const TrackingHistory = ({ status }) => {
  const timeline = useMemo(() => buildTimeline(status), [status]);

  return (
    <SurfaceCard style={styles.historyCard}>
      <Text style={styles.sectionTitle}>Tracking History</Text>
      <View style={styles.timeline}>
        {timeline.map((step, index) => (
          <TimelineStep
            key={step.title}
            step={step}
            isLast={index === timeline.length - 1}
          />
        ))}
      </View>
    </SurfaceCard>
  );
};

const ProductThumb = ({ item, overflowLabel }) => {
  if (overflowLabel) {
    return (
      <View style={styles.thumbOverflow}>
        <Text style={styles.thumbOverflowText}>{overflowLabel}</Text>
      </View>
    );
  }

  if (!item?.image) {
    return (
      <View style={styles.thumbPlaceholder}>
        <Ionicons name="bag-handle-outline" size={22} color={TEXT_LIGHT} />
      </View>
    );
  }

  return <Image source={{ uri: item.image }} style={styles.productThumb} />;
};

const OrderSummary = ({ summary }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const previewItems = summary.items.slice(0, 2);
  const previewCount = previewItems.length;
  const remaining = Math.max(summary.itemCount - previewCount, 0);
  const emptyPreviewCount = previewCount === 0 ? Math.min(summary.itemCount, 2) : 0;

  return (
    <SurfaceCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryHeaderText}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <Text style={styles.summaryMeta}>
            {summary.vendorCount} Vendor{summary.vendorCount === 1 ? '' : 's'} {'\u2022'}{' '}
            {summary.itemCount} Item{summary.itemCount === 1 ? '' : 's'}
          </Text>
        </View>
        <Text style={styles.summaryTotal}>{formatNaira(summary.total)}</Text>
      </View>

      <View style={styles.thumbsRow}>
        {previewItems.map((item) => (
          <ProductThumb key={`${item.vendorName}-${item.id}`} item={item} />
        ))}
        {Array.from({ length: emptyPreviewCount }).map((_, index) => (
          <ProductThumb key={`empty-${index}`} />
        ))}
        {remaining > 0 ? <ProductThumb overflowLabel={`+${remaining}`} /> : null}
      </View>

      {detailsOpen ? (
        <View style={styles.detailsList}>
          {summary.packages.length === 0 ? (
            <View style={styles.detailEmptyRow}>
              <Ionicons name="cube-outline" size={18} color={TEXT_LIGHT} />
              <Text style={styles.detailEmptyText}>Items are being prepared.</Text>
            </View>
          ) : (
            summary.packages.map((vendor) => (
              <View key={vendor.vendorId || vendor.vendorName} style={styles.vendorDetail}>
                <Text style={styles.vendorDetailName}>{vendor.vendorName}</Text>
                {vendor.items.map((item) => (
                  <View key={item.id} style={styles.detailItemRow}>
                    <Text style={styles.detailItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.detailItemQty}>x{item.quantity || 1}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      ) : null}

      <Pressable
        style={styles.viewDetailsBtn}
        onPress={() => setDetailsOpen((open) => !open)}
      >
        <Text style={styles.viewDetailsText}>
          {detailsOpen ? 'Hide Details' : 'View Details'}
        </Text>
        <Ionicons
          name={detailsOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={BLUE}
        />
      </Pressable>
    </SurfaceCard>
  );
};

const TrackOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const order = route.params?.order || fallbackOrder;
  const statusMeta = getStatusMeta(order.status);
  const deliveryText = getDeliveryText(order);
  const summary = useMemo(() => getOrderSummary(order), [order]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={25} color={TEXT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>{order.id || fallbackOrder.id}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
          ]}
        >
          <Text style={[styles.statusText, { color: statusMeta.tone }]}>
            {statusMeta.label.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MapPreview driverName={order.driverName || 'Chinedu O.'} />
        <EstimateCard deliveryText={deliveryText} />
        <TrackingHistory status={order.status} />
        <OrderSummary summary={summary} />

        <View style={styles.actions}>
          <Pressable style={styles.supportBtn}>
            <Ionicons name="headset-outline" size={19} color="#FFFFFF" />
            <Text style={styles.supportText}>Contact Support</Text>
          </Pressable>

          <Pressable style={styles.reportBtn}>
            <Text style={styles.reportText}>Report Issue</Text>
          </Pressable>

          {order.status !== 'Completed' ? (
            <Pressable style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel Order</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: BG,
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
    marginTop: 4,
  },
  statusPill: {
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 46,
  },
  surfaceCard: {
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  mapCard: {
    height: 246,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#415654',
    borderWidth: 8,
    borderColor: CARD,
    marginBottom: 24,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  mapSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  mapShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  driverCard: {
    position: 'absolute',
    left: 18,
    bottom: 16,
    width: 156,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  driverIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverBody: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginTop: 3,
  },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 22,
    marginBottom: 24,
  },
  estimateIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estimateBody: {
    flex: 1,
  },
  estimateLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: BLUE,
    letterSpacing: 1.4,
  },
  estimateText: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginTop: 6,
  },
  historyCard: {
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 28,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineRail: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotDone: {
    backgroundColor: BLUE,
  },
  timelineDotCurrent: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ORANGE,
    borderWidth: 5,
    borderColor: 'rgba(255, 90, 0, 0.16)',
    marginTop: -10,
  },
  timelineDotAlert: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C0392B',
    borderWidth: 5,
    borderColor: 'rgba(192, 57, 43, 0.14)',
    marginTop: -8,
  },
  timelineDotPending: {
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    minHeight: 44,
  },
  timelineLineActive: {
    backgroundColor: PRIMARY,
  },
  timelineLineMuted: {
    backgroundColor: '#E0E0E0',
  },
  timelineBody: {
    flex: 1,
    paddingLeft: 18,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 5,
  },
  timelineTitleCurrent: {
    color: '#D92800',
  },
  timelineTitlePending: {
    color: TEXT_LIGHT,
  },
  timelineDetail: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 21,
  },
  timelineDetailPending: {
    color: TEXT_LIGHT,
  },
  timelineMeta: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 3,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 26,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 5,
  },
  summaryMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: BLUE,
  },
  summaryTotal: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
  },
  thumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 26,
    marginBottom: 22,
  },
  productThumb: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  thumbPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverflow: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverflowText: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
  },
  detailsList: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 16,
    marginBottom: 8,
    gap: 14,
  },
  detailEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailEmptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  vendorDetail: {
    gap: 8,
  },
  vendorDetailName: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItemName: {
    flex: 1,
    fontSize: 13,
    color: TEXT_MUTED,
  },
  detailItemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '600',
    color: BLUE,
  },
  actions: {
    gap: 12,
  },
  supportBtn: {
    minHeight: 62,
    borderRadius: 8,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },
  supportText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  reportBtn: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(181, 59, 24, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  reportText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3F1710',
  },
});

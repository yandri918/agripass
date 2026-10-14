export type Role = "OWNER" | "STAFF";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  contactPublic: string;
  fulfillmentSettings: {
    pickup: {
      enabled: boolean;
      hours: string;
      address: string;
    };
    delivery: {
      enabled: boolean;
      maxRadiusKm: number;
      flatFeeIdr: number;
      scheduleNotes: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  contactPrivate: string;
  sourceNotes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  publicId: string; // for QR, e.g. "prod-tomat-buah"
  name: string;
  aliases: string;
  category: string;
  saleUnit: string; // "kg" | "ikat" | "pack"
  priceIdr: number;
  published: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = "ACTIVE" | "DEPLETED" | "ARCHIVED";

export interface Batch {
  id: string;
  productId: string;
  supplierId: string | null;
  publicId: string; // for QR passport, e.g. "batch-tomat-today"
  receivedAt: string;
  harvestDate: string | null;
  origin: string | null;
  receivedQty: number;
  initialDamageQty: number;
  salableQty: number;
  purchaseCost: number;
  freightCost: number;
  prepCost: number;
  unitCost: number; // (purchaseCost + freightCost + prepCost) / salableQty
  status: BatchStatus;
  notes: string;
  freshnessScore?: number;
  freshnessGrade?: string;
  inspectionPhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | "INTAKE"
  | "SPOILAGE_INITIAL"
  | "SPOILAGE_POST"
  | "SALE"
  | "CORRECTION"
  | "RETURN";

export interface StockMovement {
  id: string;
  batchId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  orderId?: string | null;
  actorId?: string;
  createdAt: string;
}

export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ACCEPTED"
  | "PREPARING"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  requestedQty: number;
  actualQty: number | null;
  unit: string;
  priceSnapshot: number;
  subtotal: number;
  notes?: string;
  allocatedBatchId?: string | null;
}

export interface Reservation {
  id: string;
  orderItemId: string;
  batchId: string;
  quantity: number;
  status: "ACTIVE" | "FULFILLED" | "RELEASED";
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  shopId: string;
  publicCode: string; // e.g. "ORD-9421"
  status: OrderStatus;
  customerName: string;
  customerContactPrivate: string;
  fulfillmentMethod: "PICKUP" | "DELIVERY";
  requestedTimeText: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalSnapshot: number;
  version: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductClaim {
  id: string;
  batchId: string;
  claim: string;
  sourceType: "SELLER_INSPECTION" | "SUPPLIER_STATEMENT" | "TEST_DOCUMENT";
  evidenceRef?: string;
  publicationStatus: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

export interface StockOverview {
  totalProducts: number;
  totalActiveBatches: number;
  totalPhysicalQty: number;
  totalReservedQty: number;
  totalAvailableQty: number;
  totalStockValueIdr: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSpoilageQty: number;
}

export interface InventoryItemBatch {
  id: string;
  publicId: string;
  salableQty: number;
  unitCost: number;
  receivedAt: string;
  origin: string | null;
  supplierName: string | null;
  freshnessGrade?: string;
  freshnessScore?: number;
  inspectionPhoto?: string;
}

export interface InventoryItem {
  id: string;
  publicId: string;
  name: string;
  aliases: string;
  category: string;
  saleUnit: string;
  priceIdr: number;
  published: boolean;
  physicalQty: number;
  reservedQty: number;
  availableQty: number;
  activeBatchCount: number;
  status: "SAFE" | "LOW" | "OUT";
  oldestBatchDate: string | null;
  oldestBatchAgeHours: number | null;
  stockValueIdr: number;
  batches: InventoryItemBatch[];
}

export interface StockMovementWithDetails {
  id: string;
  batchId: string;
  batchPublicId: string;
  productId: string;
  productName: string;
  saleUnit: string;
  type: MovementType;
  quantity: number;
  reason: string;
  orderId?: string | null;
  actorId?: string;
  createdAt: string;
}

export interface StockAdjustmentInput {
  batchId?: string;
  productId?: string;
  type: MovementType;
  quantity: number;
  reason: string;
  actorId?: string;
}

export interface CommodityPerformance {
  productId: string;
  publicId: string;
  name: string;
  category: string;
  saleUnit: string;
  currentPrice: number;
  averageUnitCost: number;
  soldQty: number;
  revenueIdr: number;
  cogsIdr: number;
  grossProfitIdr: number;
  grossMarginPercent: number;
  markupPercent: number;
  velocity: "FAST" | "MODERATE" | "SLOW";
  stockAvailable: number;
  stockStatus: "SAFE" | "LOW" | "OUT";
}

export interface MarginSimulationItem {
  productId: string;
  productName: string;
  saleUnit: string;
  unitCost: number;
  currentPrice: number;
  currentMarginPercent: number;
  suggestedPrice20: number;
  suggestedPrice30: number;
  suggestedPrice40: number;
}

export interface ProfitAnalyticsSummary {
  totalCompletedOrders: number;
  totalRevenueIdr: number;
  totalCogsIdr: number;
  totalGrossProfitIdr: number;
  averageGrossMarginPercent: number;
  averageMarkupPercent: number;
  averageOrderValueIdr: number;

  totalPhysicalStockQty: number;
  totalStockAssetCostIdr: number;
  totalPotentialRetailValueIdr: number;
  potentialRemainingProfitIdr: number;
  potentialRemainingMarginPercent: number;

  totalSpoilageQty: number;
  totalSpoilageLossCostIdr: number;

  pickupOrdersCount: number;
  pickupRevenueIdr: number;
  deliveryOrdersCount: number;
  deliveryRevenueIdr: number;

  topCommodities: CommodityPerformance[];
  marginSimulations: MarginSimulationItem[];
  recentCompletedOrders: {
    orderId: string;
    publicCode: string;
    customerName: string;
    fulfillmentMethod: "PICKUP" | "DELIVERY";
    completedAt: string;
    revenueIdr: number;
    cogsIdr: number;
    profitIdr: number;
    marginPercent: number;
    itemSummary: string;
  }[];
}

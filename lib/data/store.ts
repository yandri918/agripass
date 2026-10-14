import fs from "fs";
import path from "path";
import {
  initialBatches,
  initialClaims,
  initialOrders,
  initialProducts,
  initialShop,
  initialSuppliers,
} from "./seed-data";
import {
  Batch,
  CommodityPerformance,
  InventoryItem,
  MarginSimulationItem,
  MovementType,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductClaim,
  ProfitAnalyticsSummary,
  Reservation,
  Shop,
  StockAdjustmentInput,
  StockMovement,
  StockMovementWithDetails,
  StockOverview,
  Supplier,
} from "./types";

interface DbState {
  shop: Shop;
  suppliers: Supplier[];
  products: Product[];
  batches: Batch[];
  claims: ProductClaim[];
  orders: Order[];
  reservations: Reservation[];
  stockMovements: StockMovement[];
}

// Generate initial stock movements from initial batches
const initialMovements: StockMovement[] = [];
initialBatches.forEach((b, idx) => {
  initialMovements.push({
    id: `mov-init-${idx + 1}-in`,
    batchId: b.id,
    type: "INTAKE",
    quantity: b.receivedQty,
    reason: `Penerimaan awal pasokan (${b.origin || "Pemasok"})`,
    actorId: "seller",
    createdAt: b.receivedAt,
  });
  if (b.initialDamageQty > 0) {
    initialMovements.push({
      id: `mov-init-${idx + 1}-spoil`,
      batchId: b.id,
      type: "SPOILAGE_INITIAL",
      quantity: -b.initialDamageQty,
      reason: "Sortasi awal buah/daun layu saat terima",
      actorId: "seller",
      createdAt: b.receivedAt,
    });
  }
});

// Database Persistence Configuration
function getEffectiveDbPath(): string {
  if (process.env.DATABASE_STORAGE_PATH) {
    return process.env.DATABASE_STORAGE_PATH;
  }

  // 1. Try default project data directory
  const projectPath = path.join(process.cwd(), "data", "agripass-database.json");
  try {
    const dir = path.dirname(projectPath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    const testFile = path.join(dir, `.test-write-${Date.now()}.tmp`);
    fs.writeFileSync(/*turbopackIgnore: true*/ testFile, "ok", "utf-8");
    fs.unlinkSync(/*turbopackIgnore: true*/ testFile);
    return projectPath;
  } catch {
    // 2. Fallback to /tmp on Linux/Railway container if /app/data is not writable
    const fallbackPath =
      process.platform === "win32"
        ? path.join(process.cwd(), "agripass-database.json")
        : "/tmp/agripass-database.json";
    return fallbackPath;
  }
}

let activeDbFilePath = getEffectiveDbPath();

function loadDbFromDisk(): DbState | null {
  try {
    if (typeof process === "undefined") return null;

    // Check effective writable path first, then fallback to repo data path
    const candidatePaths = [
      activeDbFilePath,
      path.join(process.cwd(), "data", "agripass-database.json"),
    ];

    for (const cand of candidatePaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ cand)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ cand, "utf-8");
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.products) &&
          Array.isArray(parsed.batches) &&
          Array.isArray(parsed.stockMovements)
        ) {
          activeDbFilePath = cand;
          return parsed as DbState;
        }
      }
    }
  } catch (err) {
    console.error("Gagal membaca database AgriPass dari disk:", err);
  }
  return null;
}

let lastPersistError: string | null = null;

function persistDbToDisk(state?: DbState): void {
  try {
    const targetState = state || globalStore.__agripassDb;
    if (!targetState || typeof process === "undefined") return;

    const targetPath = activeDbFilePath;
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }

    const tempFile = `${targetPath}.${Date.now()}.tmp`;
    fs.writeFileSync(/*turbopackIgnore: true*/ tempFile, JSON.stringify(targetState, null, 2), "utf-8");
    fs.renameSync(/*turbopackIgnore: true*/ tempFile, targetPath);
    lastPersistError = null;
  } catch (err: any) {
    console.error("Gagal menyimpan database AgriPass ke disk utama, mencoba fallback:", err);
    lastPersistError = err?.message || String(err);

    // Fallback emergency save to /tmp
    try {
      const emergencyPath =
        process.platform === "win32"
          ? path.join(process.cwd(), "agripass-database-fallback.json")
          : "/tmp/agripass-database.json";
      const targetState = state || globalStore.__agripassDb;
      if (targetState) {
        fs.writeFileSync(/*turbopackIgnore: true*/ emergencyPath, JSON.stringify(targetState, null, 2), "utf-8");
        activeDbFilePath = emergencyPath;
        lastPersistError = null;
      }
    } catch (e2) {
      console.error("Emergency persist failed:", e2);
    }
  }
}

// Global in-memory singleton state with Disk Sync
const globalStore = globalThis as unknown as {
  __agripassDb?: DbState;
};

if (!globalStore.__agripassDb) {
  const fromDisk = loadDbFromDisk();
  if (fromDisk) {
    globalStore.__agripassDb = fromDisk;
    if (!globalStore.__agripassDb.orders || globalStore.__agripassDb.orders.length === 0) {
      globalStore.__agripassDb.orders = [...initialOrders];
      persistDbToDisk(globalStore.__agripassDb);
    }
  } else {
    globalStore.__agripassDb = {
      shop: { ...initialShop },
      suppliers: [...initialSuppliers],
      products: [...initialProducts],
      batches: [...initialBatches],
      claims: [...initialClaims],
      orders: [...initialOrders],
      reservations: [],
      stockMovements: [...initialMovements],
    };
    persistDbToDisk(globalStore.__agripassDb);
  }
} else if (!globalStore.__agripassDb.stockMovements || globalStore.__agripassDb.stockMovements.length === 0) {
  globalStore.__agripassDb.stockMovements = [...initialMovements];
  if (!globalStore.__agripassDb.orders || globalStore.__agripassDb.orders.length === 0) {
    globalStore.__agripassDb.orders = [...initialOrders];
  }
  persistDbToDisk(globalStore.__agripassDb);
}

const db = globalStore.__agripassDb;

export const dataStore = {
  // --- TOKO ---
  getShop(slug = "berkah-mandiri"): Shop {
    return db.shop;
  },

  updateShop(updates: Partial<Shop>): Shop {
    db.shop = { ...db.shop, ...updates, updatedAt: new Date().toISOString() };
    persistDbToDisk(db);
    return db.shop;
  },

  // --- PEMASOK ---
  getSuppliers(): Supplier[] {
    return db.suppliers;
  },

  // --- PRODUK ---
  getProducts(onlyPublished = false): (Product & { totalStock: number; activeBatchCount: number })[] {
    return db.products
      .filter((p) => (!onlyPublished ? true : p.published))
      .map((p) => {
        const activeBatches = db.batches.filter(
          (b) => b.productId === p.id && b.status === "ACTIVE"
        );
        const totalStock = activeBatches.reduce((acc, b) => acc + b.salableQty, 0);
        return {
          ...p,
          totalStock: Math.round(totalStock * 10) / 10,
          activeBatchCount: activeBatches.length,
        };
      });
  },

  getProductByPublicId(publicId: string) {
    const product = db.products.find((p) => p.publicId === publicId);
    if (!product) return null;

    const batches = db.batches
      .filter((b) => b.productId === product.id && b.status === "ACTIVE")
      .map((b) => {
        const supplier = db.suppliers.find((s) => s.id === b.supplierId) || null;
        const claims = db.claims.filter(
          (c) => c.batchId === b.id && c.publicationStatus === "PUBLISHED"
        );
        return {
          ...b,
          supplier,
          claims,
        };
      });

    return {
      ...product,
      batches,
    };
  },

  updateProductPrice(productId: string, newPriceIdr: number, published?: boolean) {
    const prod = db.products.find((p) => p.id === productId || p.publicId === productId);
    if (!prod) throw new Error("Produk tidak ditemukan");
    prod.priceIdr = newPriceIdr;
    if (published !== undefined) prod.published = published;
    prod.updatedAt = new Date().toISOString();
    persistDbToDisk(db);
    return prod;
  },

  // --- BATCH & BARANG MASUK (Blueprint Section 10.1) ---
  getBatches(productId?: string) {
    let list = db.batches;
    if (productId) list = list.filter((b) => b.productId === productId);
    return list.map((b) => {
      const product = db.products.find((p) => p.id === b.productId)!;
      const supplier = db.suppliers.find((s) => s.id === b.supplierId) || null;
      const claims = db.claims.filter((c) => c.batchId === b.id);
      return {
        ...b,
        product,
        supplier,
        claims,
      };
    });
  },

  getBatchByPublicId(publicId: string) {
    const batch = db.batches.find((b) => b.publicId === publicId);
    if (!batch) return null;
    const product = db.products.find((p) => p.id === batch.productId)!;
    const supplier = db.suppliers.find((s) => s.id === batch.supplierId) || null;
    const claims = db.claims.filter((c) => c.batchId === batch.id);
    return {
      ...batch,
      product,
      supplier,
      claims,
    };
  },

  createBatchIntake(input: {
    productId: string;
    supplierId?: string | null;
    receivedQty: number;
    initialDamageQty: number;
    purchaseCost: number;
    freightCost: number;
    prepCost?: number;
    origin?: string;
    harvestDate?: string | null;
    notes?: string;
    claimText?: string;
    freshnessScore?: number;
    freshnessGrade?: string;
    inspectionPhoto?: string;
  }): Batch {
    const product = db.products.find((p) => p.id === input.productId);
    if (!product) throw new Error("Produk tidak valid");

    // Rumus Blueprint:
    // kuantitas_layak_jual = kuantitas_diterima - rusak_awal
    // biaya_batch = biaya_pembelian + alokasi_ongkos + biaya_persiapan
    // biaya_per_unit_layak_jual = biaya_batch / kuantitas_layak_jual
    const salableQty = Math.max(0, input.receivedQty - input.initialDamageQty);
    const totalCost = input.purchaseCost + input.freightCost + (input.prepCost || 0);
    const unitCost = salableQty > 0 ? Math.round((totalCost / salableQty) * 100) / 100 : 0;

    const newBatchId = `batch-${Date.now()}`;
    const newPublicId = `batch-${product.publicId.replace("prod-", "")}-${Date.now().toString().slice(-4)}`;

    const newBatch: Batch = {
      id: newBatchId,
      productId: product.id,
      supplierId: input.supplierId || null,
      publicId: newPublicId,
      receivedAt: new Date().toISOString(),
      harvestDate: input.harvestDate || null,
      origin: input.origin || null,
      receivedQty: input.receivedQty,
      initialDamageQty: input.initialDamageQty,
      salableQty: salableQty,
      purchaseCost: input.purchaseCost,
      freightCost: input.freightCost,
      prepCost: input.prepCost || 0,
      unitCost: unitCost,
      status: "ACTIVE",
      notes: input.notes || `Penerimaan ${input.receivedQty} ${product.saleUnit}`,
      freshnessScore: input.freshnessScore,
      freshnessGrade: input.freshnessGrade,
      inspectionPhoto: input.inspectionPhoto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.batches.unshift(newBatch);

    // Stock movements
    this.recordStockMovement(newBatch.id, "INTAKE", input.receivedQty, "Penerimaan barang masuk");
    if (input.initialDamageQty > 0) {
      this.recordStockMovement(
        newBatch.id,
        "SPOILAGE_INITIAL",
        -input.initialDamageQty,
        "Susut/rusak awal saat sortasi"
      );
    }

    if (input.claimText) {
      db.claims.push({
        id: `claim-${Date.now()}`,
        batchId: newBatch.id,
        claim: input.claimText,
        sourceType: "SELLER_INSPECTION",
        publicationStatus: "PUBLISHED",
        createdAt: new Date().toISOString(),
      });
    }

    persistDbToDisk(db);
    return newBatch;
  },

  recordStockMovement(
    batchId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    orderId?: string
  ) {
    const mov: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      batchId,
      type,
      quantity,
      reason,
      orderId,
      actorId: "seller",
      createdAt: new Date().toISOString(),
    };
    db.stockMovements.push(mov);
    persistDbToDisk(db);
    return mov;
  },

  // --- PESANAN & RESERVASI ATOMIK (Blueprint Section 11) ---
  getOrders(): Order[] {
    return db.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getOrderById(orderId: string): Order | null {
    return db.orders.find((o) => o.id === orderId || o.publicCode === orderId) || null;
  },

  createOrder(input: {
    customerName: string;
    customerContactPrivate: string;
    fulfillmentMethod: "PICKUP" | "DELIVERY";
    requestedTimeText: string;
    deliveryAddress?: string;
    items: {
      productId: string;
      requestedQty: number;
      unit: string;
      notes?: string;
    }[];
    notes?: string;
  }): Order {
    const publicCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    let totalSnapshot = 0;
    const orderItems: OrderItem[] = input.items.map((item, idx) => {
      const prod = db.products.find((p) => p.id === item.productId)!;
      const subtotal = Math.round(prod.priceIdr * item.requestedQty);
      totalSnapshot += subtotal;

      return {
        id: `item-${orderId}-${idx + 1}`,
        orderId: orderId,
        productId: prod.id,
        productName: prod.name,
        requestedQty: item.requestedQty,
        actualQty: null,
        unit: item.unit || prod.saleUnit,
        priceSnapshot: prod.priceIdr,
        subtotal: subtotal,
        notes: item.notes,
        allocatedBatchId: null,
      };
    });

    const newOrder: Order = {
      id: orderId,
      shopId: db.shop.id,
      publicCode,
      status: "SUBMITTED",
      customerName: input.customerName,
      customerContactPrivate: input.customerContactPrivate,
      fulfillmentMethod: input.fulfillmentMethod,
      requestedTimeText: input.requestedTimeText,
      deliveryAddress: input.deliveryAddress,
      items: orderItems,
      totalSnapshot,
      version: 1,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    persistDbToDisk(db);
    return newOrder;
  },

  /**
   * Penerimaan Pesanan: Mencadangkan stok secara atomik
   */
  acceptOrder(orderId: string): Order {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");
    if (order.status !== "SUBMITTED") {
      throw new Error(`Tidak dapat menerima pesanan dengan status ${order.status}`);
    }

    // Periksa stok dan alokasikan batch
    for (const item of order.items) {
      const activeBatches = db.batches.filter(
        (b) => b.productId === item.productId && b.status === "ACTIVE" && b.salableQty > 0
      );

      // Hitung stok tersedia yang belum dicadangkan
      let needed = item.requestedQty;
      for (const batch of activeBatches) {
        if (needed <= 0) break;
        const reservedInBatch = db.reservations
          .filter((r) => r.batchId === batch.id && r.status === "ACTIVE")
          .reduce((sum, r) => sum + r.quantity, 0);

        const availableToReserve = Math.max(0, batch.salableQty - reservedInBatch);
        const toReserve = Math.min(needed, availableToReserve);

        if (toReserve > 0) {
          db.reservations.push({
            id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderItemId: item.id,
            batchId: batch.id,
            quantity: toReserve,
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          item.allocatedBatchId = batch.id;
          needed -= toReserve;
        }
      }
    }

    order.status = "ACCEPTED";
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    persistDbToDisk(db);
    return order;
  },

  /**
   * Penjual menimbang barang: Perbarui kuantitas aktual
   */
  prepareOrder(
    orderId: string,
    actualItems: { itemId: string; actualQty: number }[]
  ): Order {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");

    let newTotal = 0;
    let hasMaterialChange = false;

    for (const act of actualItems) {
      const item = order.items.find((i) => i.id === act.itemId);
      if (item) {
        const diffPercent = Math.abs(act.actualQty - item.requestedQty) / item.requestedQty;
        if (diffPercent > 0.1) hasMaterialChange = true;

        item.actualQty = act.actualQty;
        item.subtotal = Math.round(item.priceSnapshot * act.actualQty);
        newTotal += item.subtotal;
      }
    }

    order.totalSnapshot = newTotal;
    order.status = hasMaterialChange ? "AWAITING_CONFIRMATION" : "PREPARING";
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    persistDbToDisk(db);
    return order;
  },

  /**
   * Pesanan Selesai: Kurangi stok fisik & lepaskan reservasi
   */
  completeOrder(orderId: string): Order {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");

    const orderReservations = db.reservations.filter(
      (r) => order.items.some((i) => i.id === r.orderItemId) && r.status === "ACTIVE"
    );

    for (const res of orderReservations) {
      const batch = db.batches.find((b) => b.id === res.batchId);
      if (batch) {
        batch.salableQty = Math.max(0, batch.salableQty - res.quantity);
        if (batch.salableQty === 0) batch.status = "DEPLETED";
        this.recordStockMovement(batch.id, "SALE", -res.quantity, "Pesanan selesai", order.id);
      }
      res.status = "FULFILLED";
      res.updatedAt = new Date().toISOString();
    }

    order.status = "COMPLETED";
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    persistDbToDisk(db);
    return order;
  },

  /**
   * Pembatalan Pesanan: Lepaskan reservasi tanpa mengurangi fisik
   */
  cancelOrder(orderId: string, reason?: string): Order {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");

    const orderReservations = db.reservations.filter(
      (r) => order.items.some((i) => i.id === r.orderItemId) && r.status === "ACTIVE"
    );

    for (const res of orderReservations) {
      res.status = "RELEASED";
      res.updatedAt = new Date().toISOString();
    }

    order.status = "CANCELLED";
    order.notes = reason ? `${order.notes || ""} [Batal: ${reason}]` : order.notes;
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    persistDbToDisk(db);
    return order;
  },

  // --- MANAJEMEN STOK & INVENTORI PENJUAL ---
  getStockOverview(): StockOverview {
    const products = db.products;
    const activeBatches = db.batches.filter((b) => b.status === "ACTIVE");

    let totalPhysicalQty = 0;
    let totalStockValueIdr = 0;
    for (const b of activeBatches) {
      totalPhysicalQty += b.salableQty;
      totalStockValueIdr += b.salableQty * (b.unitCost || 0);
    }

    const activeReservations = db.reservations.filter((r) => r.status === "ACTIVE");
    const totalReservedQty = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
    const totalAvailableQty = Math.max(0, totalPhysicalQty - totalReservedQty);

    const spoilageMovements = db.stockMovements.filter(
      (m) => m.type === "SPOILAGE_INITIAL" || m.type === "SPOILAGE_POST"
    );
    const totalSpoilageQty = Math.abs(
      spoilageMovements.reduce((sum, m) => sum + m.quantity, 0)
    );

    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const p of products) {
      const productBatches = activeBatches.filter((b) => b.productId === p.id);
      const prodPhysical = productBatches.reduce((sum, b) => sum + b.salableQty, 0);
      if (prodPhysical === 0) {
        outOfStockCount++;
      } else if (prodPhysical <= 10) {
        lowStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalActiveBatches: activeBatches.length,
      totalPhysicalQty: Math.round(totalPhysicalQty * 10) / 10,
      totalReservedQty: Math.round(totalReservedQty * 10) / 10,
      totalAvailableQty: Math.round(totalAvailableQty * 10) / 10,
      totalStockValueIdr: Math.round(totalStockValueIdr),
      lowStockCount,
      outOfStockCount,
      totalSpoilageQty: Math.round(totalSpoilageQty * 10) / 10,
    };
  },

  getInventoryItems(): InventoryItem[] {
    const now = Date.now();
    return db.products.map((p) => {
      const productBatches = db.batches
        .filter((b) => b.productId === p.id && b.status === "ACTIVE")
        .map((b) => {
          const sup = db.suppliers.find((s) => s.id === b.supplierId);
          return {
            id: b.id,
            publicId: b.publicId,
            salableQty: b.salableQty,
            unitCost: b.unitCost,
            receivedAt: b.receivedAt,
            origin: b.origin,
            supplierName: sup ? sup.name : null,
            freshnessGrade: b.freshnessGrade,
            freshnessScore: b.freshnessScore,
            inspectionPhoto: b.inspectionPhoto,
          };
        });

      const physicalQty =
        Math.round(productBatches.reduce((acc, b) => acc + b.salableQty, 0) * 10) / 10;

      const productReservations = db.reservations.filter((r) => {
        if (r.status !== "ACTIVE") return false;
        const batch = db.batches.find((b) => b.id === r.batchId);
        return batch && batch.productId === p.id;
      });
      const reservedQty =
        Math.round(productReservations.reduce((acc, r) => acc + r.quantity, 0) * 10) / 10;

      const availableQty = Math.max(0, Math.round((physicalQty - reservedQty) * 10) / 10);

      let status: "SAFE" | "LOW" | "OUT" = "SAFE";
      if (physicalQty === 0) status = "OUT";
      else if (physicalQty <= 10) status = "LOW";

      let oldestBatchDate: string | null = null;
      let oldestBatchAgeHours: number | null = null;
      if (productBatches.length > 0) {
        const sorted = [...productBatches].sort(
          (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        );
        oldestBatchDate = sorted[0].receivedAt;
        oldestBatchAgeHours = Math.round(
          (now - new Date(sorted[0].receivedAt).getTime()) / (1000 * 60 * 60)
        );
      }

      const stockValueIdr = Math.round(
        productBatches.reduce((sum, b) => sum + b.salableQty * b.unitCost, 0)
      );

      return {
        id: p.id,
        publicId: p.publicId,
        name: p.name,
        aliases: p.aliases,
        category: p.category,
        saleUnit: p.saleUnit,
        priceIdr: p.priceIdr,
        published: p.published,
        physicalQty,
        reservedQty,
        availableQty,
        activeBatchCount: productBatches.length,
        status,
        oldestBatchDate,
        oldestBatchAgeHours,
        stockValueIdr,
        batches: productBatches,
      };
    });
  },

  getStockMovements(productId?: string, limit = 50): StockMovementWithDetails[] {
    let list = db.stockMovements;
    if (productId) {
      const batchIds = db.batches.filter((b) => b.productId === productId).map((b) => b.id);
      list = list.filter((m) => batchIds.includes(m.batchId));
    }

    return list
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((m) => {
        const batch = db.batches.find((b) => b.id === m.batchId);
        const product = batch ? db.products.find((p) => p.id === batch.productId) : null;
        return {
          id: m.id,
          batchId: m.batchId,
          batchPublicId: batch?.publicId || "batch-unknown",
          productId: product?.id || "",
          productName: product?.name || "Produk",
          saleUnit: product?.saleUnit || "kg",
          type: m.type,
          quantity: m.quantity,
          reason: m.reason,
          orderId: m.orderId,
          actorId: m.actorId,
          createdAt: m.createdAt,
        };
      });
  },

  adjustStock(input: StockAdjustmentInput) {
    let batch: Batch | undefined;

    const targetProduct = input.productId
      ? db.products.find((p) => p.id === input.productId || p.publicId === input.productId)
      : null;
    const resolvedProductId = targetProduct ? targetProduct.id : input.productId;

    if (input.batchId) {
      batch = db.batches.find((b) => b.id === input.batchId);
    } else if (resolvedProductId) {
      const activeBatches = db.batches.filter(
        (b) => b.productId === resolvedProductId && b.status === "ACTIVE"
      );
      if (input.quantity < 0 || input.type === "SPOILAGE_POST" || input.type === "RETURN") {
        // FIFO: kurangi batch yang lebih tua terlebih dahulu
        batch = activeBatches.sort(
          (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        )[0];
      } else {
        batch = activeBatches[0] || db.batches.find((b) => b.productId === resolvedProductId);
      }
    }

    if (!batch) {
      throw new Error("Batch produk tidak ditemukan untuk penyesuaian stok");
    }

    const product = db.products.find((p) => p.id === batch!.productId);
    if (!product) throw new Error("Produk tidak valid");

    // Tentukan delta
    let delta = input.quantity;
    if (input.type === "SPOILAGE_POST" || input.type === "RETURN") {
      delta = -Math.abs(input.quantity);
    }

    const previousQty = batch.salableQty;
    const newSalableQty = Math.max(0, Math.round((previousQty + delta) * 100) / 100);
    batch.salableQty = newSalableQty;
    batch.status = newSalableQty === 0 ? "DEPLETED" : "ACTIVE";
    batch.updatedAt = new Date().toISOString();

    const movement = this.recordStockMovement(
      batch.id,
      input.type,
      delta,
      input.reason || `Penyesuaian stok ${input.type}`,
      undefined
    );

    persistDbToDisk(db);

    return {
      batch,
      product,
      previousQty,
      newSalableQty,
      delta,
      movement,
    };
  },

  // --- LAPORAN ANALITIK KEUNTUNGAN, MARGIN & KOMODITAS (Blueprint Section 10 & 16) ---
  getProfitAnalytics(): ProfitAnalyticsSummary {
    const completedOrders = db.orders.filter((o) => o.status === "COMPLETED");

    let totalRevenueIdr = 0;
    let totalCogsIdr = 0;

    // Track per-product metrics
    const productStatsMap = new Map<
      string,
      {
        soldQty: number;
        revenueIdr: number;
        cogsIdr: number;
        orderCount: number;
      }
    >();

    for (const p of db.products) {
      productStatsMap.set(p.id, {
        soldQty: 0,
        revenueIdr: 0,
        cogsIdr: 0,
        orderCount: 0,
      });
    }

    // Calculate completed order revenues and COGS
    for (const order of completedOrders) {
      totalRevenueIdr += order.totalSnapshot;
      for (const item of order.items) {
        const qty =
          item.actualQty !== null && item.actualQty !== undefined
            ? item.actualQty
            : item.requestedQty;
        const itemRev = item.subtotal || Math.round(item.priceSnapshot * qty);

        // Determine unit cost from allocated batch, or product's active/latest batch, or fallback
        let unitCost = 0;
        if (item.allocatedBatchId) {
          const batch = db.batches.find((b) => b.id === item.allocatedBatchId);
          if (batch) unitCost = batch.unitCost;
        }
        if (!unitCost) {
          const prodBatches = db.batches.filter((b) => b.productId === item.productId);
          if (prodBatches.length > 0) {
            unitCost = prodBatches[0].unitCost;
          }
        }

        const itemCogs = Math.round(unitCost * qty);
        totalCogsIdr += itemCogs;

        const stat = productStatsMap.get(item.productId);
        if (stat) {
          stat.soldQty += qty;
          stat.revenueIdr += itemRev;
          stat.cogsIdr += itemCogs;
          stat.orderCount += 1;
        }
      }
    }

    const totalGrossProfitIdr = totalRevenueIdr - totalCogsIdr;
    const averageGrossMarginPercent =
      totalRevenueIdr > 0 ? Math.round((totalGrossProfitIdr / totalRevenueIdr) * 1000) / 10 : 0;
    const averageMarkupPercent =
      totalCogsIdr > 0 ? Math.round((totalGrossProfitIdr / totalCogsIdr) * 1000) / 10 : 0;
    const averageOrderValueIdr =
      completedOrders.length > 0 ? Math.round(totalRevenueIdr / completedOrders.length) : 0;

    // Stock valuation & potential remaining profit
    const activeBatches = db.batches.filter((b) => b.status === "ACTIVE");
    let totalPhysicalStockQty = 0;
    let totalStockAssetCostIdr = 0;
    let totalPotentialRetailValueIdr = 0;

    for (const b of activeBatches) {
      totalPhysicalStockQty += b.salableQty;
      totalStockAssetCostIdr += b.salableQty * (b.unitCost || 0);
      const prod = db.products.find((p) => p.id === b.productId);
      if (prod) {
        totalPotentialRetailValueIdr += b.salableQty * prod.priceIdr;
      }
    }

    const potentialRemainingProfitIdr = Math.max(0, totalPotentialRetailValueIdr - totalStockAssetCostIdr);
    const potentialRemainingMarginPercent =
      totalPotentialRetailValueIdr > 0
        ? Math.round((potentialRemainingProfitIdr / totalPotentialRetailValueIdr) * 1000) / 10
        : 0;

    // Spoilage impact
    const spoilageMovements = db.stockMovements.filter(
      (m) => m.type === "SPOILAGE_INITIAL" || m.type === "SPOILAGE_POST"
    );
    let totalSpoilageQty = 0;
    let totalSpoilageLossCostIdr = 0;
    for (const m of spoilageMovements) {
      const qty = Math.abs(m.quantity);
      totalSpoilageQty += qty;
      const batch = db.batches.find((b) => b.id === m.batchId);
      const cost = batch ? batch.unitCost : 0;
      totalSpoilageLossCostIdr += qty * cost;
    }

    // Pickup vs Delivery breakdown
    const pickupOrders = completedOrders.filter((o) => o.fulfillmentMethod === "PICKUP");
    const deliveryOrders = completedOrders.filter((o) => o.fulfillmentMethod === "DELIVERY");

    // Top commodities calculation
    const topCommodities: CommodityPerformance[] = db.products.map((p) => {
      const stat = productStatsMap.get(p.id) || { soldQty: 0, revenueIdr: 0, cogsIdr: 0, orderCount: 0 };
      const pBatches = db.batches.filter((b) => b.productId === p.id);
      const activePBatches = pBatches.filter((b) => b.status === "ACTIVE");
      const stockAvailable = activePBatches.reduce((sum, b) => sum + b.salableQty, 0);
      const avgCost = pBatches.length > 0 ? pBatches[0].unitCost : 0;
      const grossProfit = stat.revenueIdr - stat.cogsIdr;
      const marginPct =
        stat.revenueIdr > 0 ? Math.round((grossProfit / stat.revenueIdr) * 1000) / 10 : 0;
      const markupPct =
        stat.cogsIdr > 0 ? Math.round((grossProfit / stat.cogsIdr) * 1000) / 10 : 0;

      let velocity: "FAST" | "MODERATE" | "SLOW" = "SLOW";
      if (stat.soldQty >= 3 || stat.revenueIdr >= 40000) {
        velocity = "FAST";
      } else if (stat.soldQty > 0) {
        velocity = "MODERATE";
      }

      let stockStatus: "SAFE" | "LOW" | "OUT" = "SAFE";
      if (stockAvailable === 0) stockStatus = "OUT";
      else if (stockAvailable <= 10) stockStatus = "LOW";

      return {
        productId: p.id,
        publicId: p.publicId,
        name: p.name,
        category: p.category,
        saleUnit: p.saleUnit,
        currentPrice: p.priceIdr,
        averageUnitCost: Math.round(avgCost),
        soldQty: Math.round(stat.soldQty * 10) / 10,
        revenueIdr: stat.revenueIdr,
        cogsIdr: stat.cogsIdr,
        grossProfitIdr: grossProfit,
        grossMarginPercent: marginPct,
        markupPercent: markupPct,
        velocity,
        stockAvailable: Math.round(stockAvailable * 10) / 10,
        stockStatus,
      };
    });

    // Sort by revenueIdr desc, then soldQty desc
    topCommodities.sort((a, b) => b.revenueIdr - a.revenueIdr || b.soldQty - a.soldQty);

    // Target margin simulations (Blueprint Section 10.2)
    const marginSimulations: MarginSimulationItem[] = db.products.map((p) => {
      const pBatches = db.batches.filter((b) => b.productId === p.id);
      const cost = pBatches.length > 0 ? pBatches[0].unitCost : Math.round(p.priceIdr * 0.7);
      const currentMargin =
        p.priceIdr > 0 ? Math.round(((p.priceIdr - cost) / p.priceIdr) * 1000) / 10 : 0;

      const roundRupiah = (val: number) => Math.ceil(val / 500) * 500;

      return {
        productId: p.id,
        productName: p.name,
        saleUnit: p.saleUnit,
        unitCost: Math.round(cost),
        currentPrice: p.priceIdr,
        currentMarginPercent: currentMargin,
        suggestedPrice20: roundRupiah(cost / (1 - 0.2)),
        suggestedPrice30: roundRupiah(cost / (1 - 0.3)),
        suggestedPrice40: roundRupiah(cost / (1 - 0.4)),
      };
    });

    // Recent completed orders summary
    const recentCompletedOrders = completedOrders.slice(0, 10).map((o) => {
      let orderCogs = 0;
      for (const item of o.items) {
        const qty =
          item.actualQty !== null && item.actualQty !== undefined
            ? item.actualQty
            : item.requestedQty;
        const b = item.allocatedBatchId ? db.batches.find((bx) => bx.id === item.allocatedBatchId) : null;
        const uCost = b ? b.unitCost : 0;
        orderCogs += Math.round(uCost * qty);
      }
      const profit = o.totalSnapshot - orderCogs;
      const marginPct = o.totalSnapshot > 0 ? Math.round((profit / o.totalSnapshot) * 1000) / 10 : 0;

      return {
        orderId: o.id,
        publicCode: o.publicCode,
        customerName: o.customerName,
        fulfillmentMethod: o.fulfillmentMethod,
        completedAt: o.updatedAt,
        revenueIdr: o.totalSnapshot,
        cogsIdr: orderCogs,
        profitIdr: profit,
        marginPercent: marginPct,
        itemSummary: o.items.map((i) => `${i.productName} (${i.actualQty || i.requestedQty} ${i.unit})`).join(", "),
      };
    });

    return {
      totalCompletedOrders: completedOrders.length,
      totalRevenueIdr,
      totalCogsIdr,
      totalGrossProfitIdr,
      averageGrossMarginPercent,
      averageMarkupPercent,
      averageOrderValueIdr,

      totalPhysicalStockQty: Math.round(totalPhysicalStockQty * 10) / 10,
      totalStockAssetCostIdr: Math.round(totalStockAssetCostIdr),
      totalPotentialRetailValueIdr: Math.round(totalPotentialRetailValueIdr),
      potentialRemainingProfitIdr: Math.round(potentialRemainingProfitIdr),
      potentialRemainingMarginPercent,

      totalSpoilageQty: Math.round(totalSpoilageQty * 10) / 10,
      totalSpoilageLossCostIdr: Math.round(totalSpoilageLossCostIdr),

      pickupOrdersCount: pickupOrders.length,
      pickupRevenueIdr: pickupOrders.reduce((sum, o) => sum + o.totalSnapshot, 0),
      deliveryOrdersCount: deliveryOrders.length,
      deliveryRevenueIdr: deliveryOrders.reduce((sum, o) => sum + o.totalSnapshot, 0),

      topCommodities,
      marginSimulations,
      recentCompletedOrders,
    };
  },

  // --- DATABASE PERSISTENCE & BACKUP UTILITIES ---
  getDatabaseInfo() {
    let fileSizeKb = 0;
    let lastModified: string | null = null;
    let exists = false;
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ activeDbFilePath)) {
        exists = true;
        const stats = fs.statSync(/*turbopackIgnore: true*/ activeDbFilePath);
        fileSizeKb = Math.round((stats.size / 1024) * 10) / 10;
        lastModified = stats.mtime.toISOString();
      }
    } catch (e) {}

    return {
      persisted: true,
      storageEngine: "PERSISTENT_FILE_JSON",
      filePath: activeDbFilePath,
      fileExists: exists,
      fileSizeKb,
      lastModified,
      lastError: lastPersistError,
      counts: {
        products: db.products.length,
        batches: db.batches.length,
        activeBatches: db.batches.filter((b) => b.status === "ACTIVE").length,
        stockMovements: db.stockMovements.length,
        orders: db.orders.length,
        suppliers: db.suppliers.length,
      },
    };
  },

  exportDatabaseBackup() {
    return {
      appName: "AgriPass AI",
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      shop: db.shop,
      suppliers: db.suppliers,
      products: db.products,
      batches: db.batches,
      claims: db.claims,
      orders: db.orders,
      reservations: db.reservations,
      stockMovements: db.stockMovements,
    };
  },

  restoreDatabaseBackup(backup: any) {
    if (!backup || !Array.isArray(backup.products) || !Array.isArray(backup.batches)) {
      throw new Error("Format file backup tidak valid. Harus mengandung data produk dan batch.");
    }

    db.shop = backup.shop || { ...initialShop };
    db.suppliers = Array.isArray(backup.suppliers) ? backup.suppliers : [...initialSuppliers];
    db.products = backup.products;
    db.batches = backup.batches;
    db.claims = Array.isArray(backup.claims) ? backup.claims : [];
    db.orders = Array.isArray(backup.orders) ? backup.orders : [];
    db.reservations = Array.isArray(backup.reservations) ? backup.reservations : [];
    db.stockMovements = Array.isArray(backup.stockMovements) ? backup.stockMovements : [];

    persistDbToDisk(db);
    return this.getDatabaseInfo();
  },

  resetDatabaseToSeed() {
    db.shop = { ...initialShop };
    db.suppliers = [...initialSuppliers];
    db.products = [...initialProducts];
    db.batches = [...initialBatches];
    db.claims = [...initialClaims];
    db.orders = [...initialOrders];
    db.reservations = [];
    db.stockMovements = [...initialMovements];

    persistDbToDisk(db);
    return this.getDatabaseInfo();
  },
};

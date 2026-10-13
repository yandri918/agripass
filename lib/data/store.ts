import {
  initialBatches,
  initialClaims,
  initialProducts,
  initialShop,
  initialSuppliers,
} from "./seed-data";
import {
  Batch,
  MovementType,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductClaim,
  Reservation,
  Shop,
  StockMovement,
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

// Global in-memory singleton state
const globalStore = globalThis as unknown as {
  __agripassDb?: DbState;
};

if (!globalStore.__agripassDb) {
  globalStore.__agripassDb = {
    shop: { ...initialShop },
    suppliers: [...initialSuppliers],
    products: [...initialProducts],
    batches: [...initialBatches],
    claims: [...initialClaims],
    orders: [],
    reservations: [],
    stockMovements: [],
  };
}

const db = globalStore.__agripassDb;

export const dataStore = {
  // --- TOKO ---
  getShop(slug = "berkah-mandiri"): Shop {
    return db.shop;
  },

  updateShop(updates: Partial<Shop>): Shop {
    db.shop = { ...db.shop, ...updates, updatedAt: new Date().toISOString() };
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
    return order;
  },
};

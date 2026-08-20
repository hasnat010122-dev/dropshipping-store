import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v4 as uuid } from "uuid";

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");
const ordersFile = path.join(dataDir, "orders.json");
const suppliersFile = path.join(dataDir, "suppliers.json");
const activityFile = path.join(dataDir, "activity.json");
const returnsFile = path.join(dataDir, "returns.json");
const couponsFile = path.join(dataDir, "coupons.json");
const usersFile = path.join(dataDir, "users.json");
const otpFile = path.join(dataDir, "otp_codes.json");

export type ProductRow = {
  id: string;
  name: string;
  price: number;
  compareAt: number | null;
  category: string;
  badge: string | null;
  image: string;
  images?: string[];
  colors?: string[];
  colorImages?: Record<string, string>;
  description: string | null;
  stock: number;
  supplierId: string | null;
  supplierProductUrl: string | null;
  supplierCost: number | null;
  publicationStatus?: "draft" | "approved" | "published";
  createdAt: string;
};

export type PublicProductRow = Omit<ProductRow, "supplierId" | "supplierProductUrl" | "supplierCost">;

export function toPublicProduct(product: ProductRow): PublicProductRow {
  return Object.fromEntries(
    Object.entries(product).filter(([key]) => !["supplierId", "supplierProductUrl", "supplierCost"].includes(key))
  ) as PublicProductRow;
}

export type OrderItem = { id: string; name: string; price: number; qty: number; color?: string | null };

export type FulfillmentStatus =
  | "not_ordered"
  | "ordered_from_supplier"
  | "shipped_by_supplier"
  | "delivered";

export type OrderRow = {
  id: string;
  userId: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  couponCode: string | null;
  discount: number;
  total: number;
  status: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedAt?: string | null;
  approvedBy?: string | null;
  supplierId: string | null;
  fulfillmentStatus: FulfillmentStatus;
  supplierTrackingNumber: string | null;
  supplierTrackingUrl: string | null;
  fulfillmentNotes: string | null;
  createdAt: string;
};

export type CustomerOrderRow = Omit<OrderRow, "supplierId" | "fulfillmentNotes">;

export function toCustomerOrder(order: OrderRow): CustomerOrderRow {
  return Object.fromEntries(
    Object.entries(order).filter(([key]) => !["supplierId", "fulfillmentNotes"].includes(key))
  ) as CustomerOrderRow;
}

export type SupplierRow = {
  id: string;
  name: string;
  platform: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string;
};

export type ActivityType =
  | "order_placed"
  | "order_status_changed"
  | "order_fulfillment_updated"
  | "product_added"
  | "product_updated"
  | "product_deleted"
  | "product_approved"
  | "product_published"
  | "product_unpublished"
  | "order_approved"
  | "order_rejected"
  | "supplier_added"
  | "supplier_updated"
  | "supplier_deleted"
  | "admin_login"
  | "return_requested"
  | "return_status_changed"
  | "coupon_added"
  | "coupon_updated"
  | "coupon_deleted";

export type ActivityRow = {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
};

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(productsFile)) {
    const seed: ProductRow[] = [
      {
        id: "aurora-lamp",
        name: "Aurora Cloud Night Lamp",
        price: 2499,
        compareAt: 3999,
        category: "Home",
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 25,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "wireless-earbuds",
        name: "Pulse X Wireless Earbuds",
        price: 3299,
        compareAt: 5499,
        category: "Tech",
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 40,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "mini-blender",
        name: "Whirl Mini Portable Blender",
        price: 1899,
        compareAt: null,
        category: "Home",
        badge: null,
        image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 15,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "phone-stand",
        name: "Orbit Adjustable Phone Stand",
        price: 899,
        compareAt: 1499,
        category: "Tech",
        badge: null,
        image: "https://images.unsplash.com/photo-1583573636238-1f3a4173bb60?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 60,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "canvas-tote",
        name: "Drift Canvas Tote Bag",
        price: 1299,
        compareAt: null,
        category: "Fashion",
        badge: "New",
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 30,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "led-strip",
        name: "Glow Line RGB LED Strip",
        price: 1599,
        compareAt: 2299,
        category: "Home",
        badge: null,
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 20,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "smart-watch",
        name: "Flux Fitness Smart Watch",
        price: 4599,
        compareAt: 6999,
        category: "Tech",
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 18,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "sunglasses",
        name: "Horizon Polarized Sunglasses",
        price: 1799,
        compareAt: null,
        category: "Fashion",
        badge: null,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
        description: "A genuinely useful pick from this week's drop.",
        stock: 22,
        supplierId: null,
        supplierProductUrl: null,
        supplierCost: null,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(productsFile, JSON.stringify(seed, null, 2));
  }

  if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(suppliersFile)) fs.writeFileSync(suppliersFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(activityFile)) fs.writeFileSync(activityFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(returnsFile)) fs.writeFileSync(returnsFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(couponsFile)) fs.writeFileSync(couponsFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(otpFile)) fs.writeFileSync(otpFile, JSON.stringify([], null, 2));
}

function readJSON<T>(file: string): T {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON<T>(file: string, data: T) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- Activity log ----------

export function logActivity(type: ActivityType, message: string) {
  const rows = readJSON<ActivityRow[]>(activityFile);
  rows.push({ id: uuid(), type, message, createdAt: new Date().toISOString() });
  // keep the log from growing forever — retain the most recent 500 entries
  const trimmed = rows.slice(-500);
  writeJSON(activityFile, trimmed);
}

export function getRecentActivity(limit = 20): ActivityRow[] {
  const rows = readJSON<ActivityRow[]>(activityFile);
  return rows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// ---------- Products ----------

function sortProducts(rows: ProductRow[]): ProductRow[] {
  return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllProducts(): ProductRow[] {
  return sortProducts(readJSON<ProductRow[]>(productsFile).filter((product) => !product.publicationStatus || product.publicationStatus === "published"));
}

export function getAllProductsAdmin(): ProductRow[] {
  return sortProducts(readJSON<ProductRow[]>(productsFile));
}

export function getProductById(id: string): ProductRow | undefined {
  return getAllProducts().find((product) => product.id === id);
}

export function getProductByIdAdmin(id: string): ProductRow | undefined {
  return readJSON<ProductRow[]>(productsFile).find((product) => product.id === id);
}

export function getProductsByCategory(
  category: string,
  excludeId: string,
  limit = 4
): ProductRow[] {
  return readJSON<ProductRow[]>(productsFile)
    .filter((p) => p.category === category && p.id !== excludeId)
    .slice(0, limit);
}

export function createProduct(
  data: Omit<ProductRow, "id" | "createdAt">
): ProductRow {
  const rows = readJSON<ProductRow[]>(productsFile);
  const row: ProductRow = { ...data, id: uuid(), publicationStatus: "draft", createdAt: new Date().toISOString() };
  rows.push(row);
  writeJSON(productsFile, rows);
  logActivity("product_added", `Added product "${row.name}"`);
  return row;
}

export function updateProduct(
  id: string,
  data: Omit<ProductRow, "id" | "createdAt">
): ProductRow | undefined {
  const rows = readJSON<ProductRow[]>(productsFile);
  const idx = rows.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...data };
  writeJSON(productsFile, rows);
  logActivity("product_updated", `Updated product "${rows[idx].name}"`);
  return rows[idx];
}

export function updateProductPublicationStatus(
  id: string,
  publicationStatus: "draft" | "approved" | "published"
): ProductRow | undefined {
  const rows = readJSON<ProductRow[]>(productsFile);
  const idx = rows.findIndex((product) => product.id === id);
  if (idx === -1) return undefined;
  const previous = rows[idx].publicationStatus || "published";
  rows[idx].publicationStatus = publicationStatus;
  writeJSON(productsFile, rows);
  const type: ActivityType = publicationStatus === "approved" ? (previous === "published" ? "product_unpublished" : "product_approved") : publicationStatus === "published" ? "product_published" : "product_unpublished";
  logActivity(type, `Product "${rows[idx].name}" changed from ${previous} to ${publicationStatus}`);
  return rows[idx];
}

export function deleteProduct(id: string) {
  const rows = readJSON<ProductRow[]>(productsFile);
  const target = rows.find((p) => p.id === id);
  writeJSON(productsFile, rows.filter((p) => p.id !== id));
  if (target) logActivity("product_deleted", `Deleted product "${target.name}"`);
}

// ---------- Orders ----------

export function getAllOrders(): OrderRow[] {
  const rows = readJSON<OrderRow[]>(ordersFile);
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrdersByUserId(userId: string): OrderRow[] {
  return getAllOrders().filter((o) => o.userId === userId);
}

export function getOrderById(id: string): OrderRow | undefined {
  return readJSON<OrderRow[]>(ordersFile).find((o) => o.id === id);
}

export function createOrder(
  data: Omit<
    OrderRow,
    | "id"
    | "createdAt"
    | "status"
    | "supplierId"
    | "fulfillmentStatus"
    | "supplierTrackingNumber"
    | "supplierTrackingUrl"
    | "fulfillmentNotes"
  >
): OrderRow {
  const rows = readJSON<OrderRow[]>(ordersFile);
  const row: OrderRow = {
    ...data,
    id: uuid(),
    status: "pending",
    approvalStatus: "pending",
    approvedAt: null,
    approvedBy: null,
    supplierId: null,
    fulfillmentStatus: "not_ordered",
    supplierTrackingNumber: null,
    supplierTrackingUrl: null,
    fulfillmentNotes: null,
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  writeJSON(ordersFile, rows);
  logActivity(
    "order_placed",
    `New order from ${row.customerName} — Rs ${row.total.toLocaleString()}`
  );
  return row;
}

export function updateOrderStatus(id: string, status: string): OrderRow | undefined {
  const rows = readJSON<OrderRow[]>(ordersFile);
  const idx = rows.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  rows[idx].status = status;
  writeJSON(ordersFile, rows);
  logActivity(
    "order_status_changed",
    `Order for ${rows[idx].customerName} marked as ${status}`
  );
  return rows[idx];
}

export function updateOrderApproval(
  id: string,
  approvalStatus: "approved" | "rejected"
): OrderRow | undefined {
  const rows = readJSON<OrderRow[]>(ordersFile);
  const idx = rows.findIndex((order) => order.id === id);
  if (idx === -1) return undefined;
  rows[idx].approvalStatus = approvalStatus;
  rows[idx].approvedAt = new Date().toISOString();
  rows[idx].approvedBy = "Store owner";
  if (approvalStatus === "rejected") rows[idx].status = "cancelled";
  writeJSON(ordersFile, rows);
  logActivity(approvalStatus === "approved" ? "order_approved" : "order_rejected", `Order for ${rows[idx].customerName} ${approvalStatus} by owner`);
  return rows[idx];
}

export function updateOrderFulfillment(
  id: string,
  data: Partial<
    Pick<
      OrderRow,
      | "supplierId"
      | "fulfillmentStatus"
      | "supplierTrackingNumber"
      | "supplierTrackingUrl"
      | "fulfillmentNotes"
    >
  >
): OrderRow | undefined {
  const rows = readJSON<OrderRow[]>(ordersFile);
  const idx = rows.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...data };
  writeJSON(ordersFile, rows);
  if (data.fulfillmentStatus) {
    logActivity(
      "order_fulfillment_updated",
      `Order for ${rows[idx].customerName} fulfillment set to ${data.fulfillmentStatus.replace(/_/g, " ")}`
    );
  }
  return rows[idx];
}

// ---------- Suppliers ----------

export function getAllSuppliers(): SupplierRow[] {
  const rows = readJSON<SupplierRow[]>(suppliersFile);
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSupplierById(id: string): SupplierRow | undefined {
  return readJSON<SupplierRow[]>(suppliersFile).find((s) => s.id === id);
}

export function createSupplier(
  data: Omit<SupplierRow, "id" | "createdAt">
): SupplierRow {
  const rows = readJSON<SupplierRow[]>(suppliersFile);
  const row: SupplierRow = { ...data, id: uuid(), createdAt: new Date().toISOString() };
  rows.push(row);
  writeJSON(suppliersFile, rows);
  logActivity("supplier_added", `Added supplier "${row.name}"`);
  return row;
}

export function updateSupplier(
  id: string,
  data: Omit<SupplierRow, "id" | "createdAt">
): SupplierRow | undefined {
  const rows = readJSON<SupplierRow[]>(suppliersFile);
  const idx = rows.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...data };
  writeJSON(suppliersFile, rows);
  logActivity("supplier_updated", `Updated supplier "${rows[idx].name}"`);
  return rows[idx];
}

export function deleteSupplier(id: string) {
  const rows = readJSON<SupplierRow[]>(suppliersFile);
  const target = rows.find((s) => s.id === id);
  writeJSON(suppliersFile, rows.filter((s) => s.id !== id));
  if (target) logActivity("supplier_deleted", `Deleted supplier "${target.name}"`);
}

export function searchProducts(query: string): ProductRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
  );
}

export function getProductsForCollection(slug: string): ProductRow[] {
  const all = getAllProducts();
  switch (slug) {
    case "new-in":
      return all.slice(0, 12);
    case "trending-now":
      return all.filter((p) => p.badge === "Trending");
    case "gift-ideas":
      return all.filter((p) => p.badge === "New" || p.badge === "Trending");
    default: {
      // Match a plain category name, e.g. "tech" -> "Tech"
      const label = slug.replace(/-/g, " ");
      return all.filter((p) => p.category.toLowerCase() === label);
    }
  }
}

export function getCollectionTitle(slug: string): string {
  const titles: Record<string, string> = {
    "new-in": "New In",
    "trending-now": "Trending Now",
    "gift-ideas": "Gift Ideas",
  };
  if (titles[slug]) return titles[slug];
  const label = slug.replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export type ReturnRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "refunded";

export type ReturnRequestRow = {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  itemId: string;
  itemName: string;
  requestType: "refund" | "exchange";
  reason: string;
  comments: string | null;
  status: ReturnRequestStatus;
  createdAt: string;
};

// ---------- Return requests ----------

export function getAllReturnRequests(): ReturnRequestRow[] {
  const rows = readJSON<ReturnRequestRow[]>(returnsFile);
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReturnRequestById(id: string): ReturnRequestRow | undefined {
  return readJSON<ReturnRequestRow[]>(returnsFile).find((r) => r.id === id);
}

export function createReturnRequest(
  data: Omit<ReturnRequestRow, "id" | "createdAt" | "status">
): ReturnRequestRow {
  const rows = readJSON<ReturnRequestRow[]>(returnsFile);
  const row: ReturnRequestRow = {
    ...data,
    id: uuid(),
    status: "requested",
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  writeJSON(returnsFile, rows);
  logActivity(
    "return_requested",
    `${row.customerName} requested a ${row.requestType} for "${row.itemName}"`
  );
  return row;
}

export function updateReturnRequestStatus(
  id: string,
  status: ReturnRequestStatus
): ReturnRequestRow | undefined {
  const rows = readJSON<ReturnRequestRow[]>(returnsFile);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  rows[idx].status = status;
  writeJSON(returnsFile, rows);
  logActivity(
    "return_status_changed",
    `Return for "${rows[idx].itemName}" marked as ${status}`
  );
  return rows[idx];
}

export type CouponRow = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

// ---------- Coupons ----------

export function getAllCoupons(): CouponRow[] {
  const rows = readJSON<CouponRow[]>(couponsFile);
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCouponByCode(code: string): CouponRow | undefined {
  const target = code.trim().toUpperCase();
  return readJSON<CouponRow[]>(couponsFile).find(
    (c) => c.code.toUpperCase() === target
  );
}

export function createCoupon(
  data: Omit<CouponRow, "id" | "createdAt" | "usedCount">
): CouponRow {
  const rows = readJSON<CouponRow[]>(couponsFile);
  const row: CouponRow = {
    ...data,
    code: data.code.trim().toUpperCase(),
    id: uuid(),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  writeJSON(couponsFile, rows);
  logActivity("coupon_added", `Added coupon code "${row.code}"`);
  return row;
}

export function updateCoupon(
  id: string,
  data: Omit<CouponRow, "id" | "createdAt" | "usedCount">
): CouponRow | undefined {
  const rows = readJSON<CouponRow[]>(couponsFile);
  const idx = rows.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...data, code: data.code.trim().toUpperCase() };
  writeJSON(couponsFile, rows);
  logActivity("coupon_updated", `Updated coupon code "${rows[idx].code}"`);
  return rows[idx];
}

export function deleteCoupon(id: string) {
  const rows = readJSON<CouponRow[]>(couponsFile);
  const target = rows.find((c) => c.id === id);
  writeJSON(couponsFile, rows.filter((c) => c.id !== id));
  if (target) logActivity("coupon_deleted", `Deleted coupon code "${target.code}"`);
}

export function incrementCouponUsage(id: string) {
  const rows = readJSON<CouponRow[]>(couponsFile);
  const idx = rows.findIndex((c) => c.id === id);
  if (idx === -1) return;
  rows[idx].usedCount += 1;
  writeJSON(couponsFile, rows);
}

export type CouponValidationResult =
  | { valid: true; coupon: CouponRow; discount: number }
  | { valid: false; error: string };

export function validateCoupon(
  code: string,
  subtotal: number
): CouponValidationResult {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, error: "That code doesn't exist." };
  if (!coupon.active) return { valid: false, error: "That code is no longer active." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: "That code has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: "That code has reached its usage limit." };
  }

  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return { valid: true, coupon, discount };
}

export type Address = {
  id: string;
  label: string;
  address: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone: string;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  authProvider: "google" | "email";
  addresses: Address[];
  createdAt: string;
};

export type OtpCodeRow = {
  id: string;
  email: string;
  codeHash: string;
  code?: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
};

// ---------- Users & auth ----------

export function getUserByEmail(email: string): UserRow | undefined {
  const target = email.trim().toLowerCase();
  return readJSON<UserRow[]>(usersFile).find(
    (u) => u.email.toLowerCase() === target
  );
}

export function getUserById(id: string): UserRow | undefined {
  return readJSON<UserRow[]>(usersFile).find((u) => u.id === id);
}

export function findOrCreateUser(
  email: string,
  name: string,
  authProvider: "google" | "email"
): UserRow {
  const existing = getUserByEmail(email);
  if (existing) return existing;

  const rows = readJSON<UserRow[]>(usersFile);
  const row: UserRow = {
    id: uuid(),
    name,
    email: email.trim().toLowerCase(),
    authProvider,
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  writeJSON(usersFile, rows);
  return row;
}

export function addUserAddress(
  userId: string,
  address: Omit<Address, "id">
): UserRow | undefined {
  const rows = readJSON<UserRow[]>(usersFile);
  const idx = rows.findIndex((u) => u.id === userId);
  if (idx === -1) return undefined;
  rows[idx].addresses.push({ ...address, id: uuid() });
  writeJSON(usersFile, rows);
  return rows[idx];
}

export function deleteUserAddress(
  userId: string,
  addressId: string
): UserRow | undefined {
  const rows = readJSON<UserRow[]>(usersFile);
  const idx = rows.findIndex((u) => u.id === userId);
  if (idx === -1) return undefined;
  rows[idx].addresses = rows[idx].addresses.filter((a) => a.id !== addressId);
  writeJSON(usersFile, rows);
  return rows[idx];
}

// ---------- OTP codes ----------

function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function otpHash(email: string, code: string): string {
  return crypto.createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export function createOtpCode(email: string): { email: string; code: string } {
  const rows = readJSON<OtpCodeRow[]>(otpFile);
  const normalized = email.trim().toLowerCase();
  const code = generateOtpCode();
  const row: OtpCodeRow = {
    id: uuid(),
    email: normalized,
    codeHash: otpHash(normalized, code),
    used: false,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const filtered = rows.filter((item) => new Date(item.createdAt).getTime() > oneHourAgo);
  filtered.push(row);
  writeJSON(otpFile, filtered);
  return { email: normalized, code };
}

export function verifyOtpCode(email: string, code: string): boolean {
  const rows = readJSON<OtpCodeRow[]>(otpFile);
  const normalized = email.trim().toLowerCase();
  const hash = otpHash(normalized, code.trim());
  const idx = rows.findIndex((item) => {
    const storedHash = item.codeHash || (item.code ? otpHash(item.email, item.code) : "");
    return item.email === normalized && storedHash === hash && !item.used && new Date(item.expiresAt) > new Date();
  });
  if (idx === -1) return false;
  rows[idx].used = true;
  delete rows[idx].code;
  writeJSON(otpFile, rows);
  return true;
}

// ---------- Dashboard stats ----------

export function getDashboardStats() {
  const products = getAllProductsAdmin();
  const orders = getAllOrders();
  const suppliers = getAllSuppliers();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= today).length;
  const revenueToday = orders
    .filter((o) => new Date(o.createdAt) >= today)
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const awaitingSupplierOrder = orders.filter(
    (o) => o.fulfillmentStatus === "not_ordered"
  ).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const pendingReturns = getAllReturnRequests().filter(
    (r) => r.status === "requested"
  ).length;

  // last 7 days revenue for the chart
  const days: { date: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.createdAt);
      return t >= d && t < next;
    });
    days.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    });
  }

  // top products by units ordered
  const unitsSold: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      if (!unitsSold[item.id]) {
        unitsSold[item.id] = { name: item.name, qty: 0, revenue: 0 };
      }
      unitsSold[item.id].qty += item.qty;
      unitsSold[item.id].revenue += item.qty * item.price;
    }
  }
  const topProducts = Object.values(unitsSold)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders,
    ordersToday,
    revenueToday,
    pendingOrders,
    awaitingSupplierOrder,
    pendingReturns,
    lowStock,
    outOfStock,
    totalProducts: products.length,
    totalSuppliers: suppliers.length,
    chartData: days,
    topProducts,
  };
}

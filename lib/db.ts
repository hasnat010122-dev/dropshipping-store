/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import * as local from "@/lib/local-db";
import { assertNoSupabaseError, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export type {
  ProductRow, PublicProductRow, OrderItem, FulfillmentStatus, OrderRow,
  CustomerOrderRow, SupplierRow, ActivityType, ActivityRow,
  ReturnRequestStatus, ReturnRequestRow, CouponRow, CouponValidationResult,
  Address, UserRow, OtpCodeRow,
} from "@/lib/local-db";

import type {
  ProductRow, OrderRow, SupplierRow, ActivityType, ActivityRow,
  ReturnRequestStatus, ReturnRequestRow, CouponRow, CouponValidationResult,
  Address, UserRow,
} from "@/lib/local-db";

export const toPublicProduct = local.toPublicProduct;
export const toCustomerOrder = local.toCustomerOrder;
export const getCollectionTitle = local.getCollectionTitle;

function productFrom(row: Record<string, any>): ProductRow {
  return { id: row.id, name: row.name, price: Number(row.price), compareAt: row.compare_at == null ? null : Number(row.compare_at), category: row.category, badge: row.badge, image: row.image, images: Array.isArray(row.images) && row.images.length ? row.images : [row.image], colors: Array.isArray(row.colors) ? row.colors : [], description: row.description, stock: Number(row.stock), supplierId: row.supplier_id, supplierProductUrl: row.supplier_product_url, supplierCost: row.supplier_cost == null ? null : Number(row.supplier_cost), publicationStatus: row.publication_status, createdAt: row.created_at };
}
function productTo(row: ProductRow) {
  return { id: row.id, name: row.name, price: row.price, compare_at: row.compareAt, category: row.category, badge: row.badge, image: row.image, images: row.images || [row.image], colors: row.colors || [], description: row.description, stock: row.stock, supplier_id: row.supplierId, supplier_product_url: row.supplierProductUrl, supplier_cost: row.supplierCost, publication_status: row.publicationStatus || "published", created_at: row.createdAt };
}
function supplierFrom(row: Record<string, any>): SupplierRow {
  return { id: row.id, name: row.name, platform: row.platform, contactName: row.contact_name, phone: row.phone, email: row.email, website: row.website, notes: row.notes, createdAt: row.created_at };
}
function supplierTo(row: SupplierRow) {
  return { id: row.id, name: row.name, platform: row.platform, contact_name: row.contactName, phone: row.phone, email: row.email, website: row.website, notes: row.notes, created_at: row.createdAt };
}
function orderFrom(row: Record<string, any>): OrderRow {
  return { id: row.id, userId: row.user_id, customerName: row.customer_name, phone: row.phone, email: row.email, address: row.address, city: row.city, paymentMethod: row.payment_method, items: row.items || [], subtotal: Number(row.subtotal), couponCode: row.coupon_code, discount: Number(row.discount), total: Number(row.total), status: row.status, approvalStatus: row.approval_status, approvedAt: row.approved_at, approvedBy: row.approved_by, supplierId: row.supplier_id, fulfillmentStatus: row.fulfillment_status, supplierTrackingNumber: row.supplier_tracking_number, supplierTrackingUrl: row.supplier_tracking_url, fulfillmentNotes: row.fulfillment_notes, createdAt: row.created_at };
}
function orderTo(row: OrderRow) {
  return { id: row.id, user_id: row.userId, customer_name: row.customerName, phone: row.phone, email: row.email, address: row.address, city: row.city, payment_method: row.paymentMethod, items: row.items, subtotal: row.subtotal, coupon_code: row.couponCode, discount: row.discount, total: row.total, status: row.status, approval_status: row.approvalStatus || "pending", approved_at: row.approvedAt || null, approved_by: row.approvedBy || null, supplier_id: row.supplierId, fulfillment_status: row.fulfillmentStatus, supplier_tracking_number: row.supplierTrackingNumber, supplier_tracking_url: row.supplierTrackingUrl, fulfillment_notes: row.fulfillmentNotes, created_at: row.createdAt };
}
function couponFrom(row: Record<string, any>): CouponRow {
  return { id: row.id, code: row.code, type: row.type, value: Number(row.value), active: row.active, usageLimit: row.usage_limit, usedCount: Number(row.used_count), expiresAt: row.expires_at, createdAt: row.created_at };
}
function couponTo(row: CouponRow) {
  return { id: row.id, code: row.code, type: row.type, value: row.value, active: row.active, usage_limit: row.usageLimit, used_count: row.usedCount, expires_at: row.expiresAt, created_at: row.createdAt };
}
function returnFrom(row: Record<string, any>): ReturnRequestRow {
  return { id: row.id, orderId: row.order_id, customerName: row.customer_name, phone: row.phone, itemId: row.item_id, itemName: row.item_name, requestType: row.request_type, reason: row.reason, comments: row.comments, status: row.status, createdAt: row.created_at };
}
function returnTo(row: ReturnRequestRow) {
  return { id: row.id, order_id: row.orderId, customer_name: row.customerName, phone: row.phone, item_id: row.itemId, item_name: row.itemName, request_type: row.requestType, reason: row.reason, comments: row.comments, status: row.status, created_at: row.createdAt };
}
function userFrom(row: Record<string, any>): UserRow {
  return { id: row.id, name: row.name, email: row.email, authProvider: row.auth_provider, addresses: row.addresses || [], createdAt: row.created_at };
}

async function rows(table: string, order = "created_at") {
  const { data, error } = await getSupabaseAdmin().from(table).select("*").order(order, { ascending: false });
  assertNoSupabaseError(error, `Read ${table}`);
  return (data || []) as Record<string, any>[];
}

export async function logActivity(type: ActivityType, message: string) {
  if (!isSupabaseConfigured()) return local.logActivity(type, message);
  const { error } = await getSupabaseAdmin().from("activities").insert({ id: crypto.randomUUID(), type, message, created_at: new Date().toISOString() });
  assertNoSupabaseError(error, "Write activity");
}
export async function getRecentActivity(limit = 20): Promise<ActivityRow[]> {
  if (!isSupabaseConfigured()) return local.getRecentActivity(limit);
  const { data, error } = await getSupabaseAdmin().from("activities").select("*").order("created_at", { ascending: false }).limit(Math.min(200, Math.max(1, limit)));
  assertNoSupabaseError(error, "Read activity");
  return (data || []).map((row: any) => ({ id: row.id, type: row.type, message: row.message, createdAt: row.created_at }));
}

export async function getAllProducts(): Promise<ProductRow[]> {
  if (!isSupabaseConfigured()) return local.getAllProducts();
  const { data, error } = await getSupabaseAdmin().from("products").select("*").eq("publication_status", "published").order("created_at", { ascending: false });
  assertNoSupabaseError(error, "Read public products"); return (data || []).map(productFrom);
}
export async function getAllProductsAdmin(): Promise<ProductRow[]> {
  if (!isSupabaseConfigured()) return local.getAllProductsAdmin(); return (await rows("products")).map(productFrom);
}
export async function getProductById(id: string): Promise<ProductRow | undefined> {
  if (!isSupabaseConfigured()) return local.getProductById(id);
  const { data, error } = await getSupabaseAdmin().from("products").select("*").eq("id", id).eq("publication_status", "published").maybeSingle();
  assertNoSupabaseError(error, "Read public product"); return data ? productFrom(data) : undefined;
}
export async function getProductByIdAdmin(id: string): Promise<ProductRow | undefined> {
  if (!isSupabaseConfigured()) return local.getProductByIdAdmin(id);
  const { data, error } = await getSupabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
  assertNoSupabaseError(error, "Read product"); return data ? productFrom(data) : undefined;
}
export async function getProductsByCategory(category: string, excludeId: string, limit = 4) {
  return (await getAllProducts()).filter((p) => p.category === category && p.id !== excludeId).slice(0, limit);
}
export async function createProduct(data: Omit<ProductRow, "id" | "createdAt">): Promise<ProductRow> {
  if (!isSupabaseConfigured()) return local.createProduct(data);
  const row: ProductRow = { ...data, id: crypto.randomUUID(), publicationStatus: "draft", createdAt: new Date().toISOString() };
  const { error } = await getSupabaseAdmin().from("products").insert(productTo(row)); assertNoSupabaseError(error, "Create product");
  await logActivity("product_added", `Added product "${row.name}" as draft`); return row;
}
export async function updateProduct(id: string, data: Omit<ProductRow, "id" | "createdAt">) {
  if (!isSupabaseConfigured()) return local.updateProduct(id, data);
  const existing = await getProductByIdAdmin(id); if (!existing) return undefined;
  const row = { ...existing, ...data, id, publicationStatus: existing.publicationStatus || "published" };
  const { error } = await getSupabaseAdmin().from("products").update(productTo(row)).eq("id", id); assertNoSupabaseError(error, "Update product");
  await logActivity("product_updated", `Updated product "${row.name}"`); return row;
}
export async function updateProductPublicationStatus(id: string, status: "draft" | "approved" | "published") {
  if (!isSupabaseConfigured()) return local.updateProductPublicationStatus(id, status);
  const existing = await getProductByIdAdmin(id); if (!existing) return undefined;
  const previous = existing.publicationStatus || "published";
  const { error } = await getSupabaseAdmin().from("products").update({ publication_status: status }).eq("id", id); assertNoSupabaseError(error, "Update publication");
  const type: ActivityType = status === "approved" ? (previous === "published" ? "product_unpublished" : "product_approved") : status === "published" ? "product_published" : "product_unpublished";
  await logActivity(type, `Product "${existing.name}" changed from ${previous} to ${status}`); return { ...existing, publicationStatus: status };
}
export async function deleteProduct(id: string) {
  if (!isSupabaseConfigured()) return local.deleteProduct(id);
  const existing = await getProductByIdAdmin(id); const { error } = await getSupabaseAdmin().from("products").delete().eq("id", id); assertNoSupabaseError(error, "Delete product");
  if (existing) await logActivity("product_deleted", `Deleted product "${existing.name}"`);
}
export async function searchProducts(query: string) { const q = query.trim().toLowerCase(); return q ? (await getAllProducts()).filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)) : []; }
export async function getProductsForCollection(slug: string) {
  const all = await getAllProducts();
  if (slug === "new-in") return all.slice(0, 12); if (slug === "trending-now") return all.filter((p) => p.badge === "Trending"); if (slug === "gift-ideas") return all.filter((p) => p.badge === "New" || p.badge === "Trending");
  const label = slug.replace(/-/g, " "); return all.filter((p) => p.category.toLowerCase() === label);
}

export async function getAllOrders(): Promise<OrderRow[]> { if (!isSupabaseConfigured()) return local.getAllOrders(); return (await rows("orders")).map(orderFrom); }
export async function getOrdersByUserId(userId: string) { return (await getAllOrders()).filter((order) => order.userId === userId); }
export async function getOrderById(id: string): Promise<OrderRow | undefined> {
  if (!isSupabaseConfigured()) return local.getOrderById(id);
  const { data, error } = await getSupabaseAdmin().from("orders").select("*").eq("id", id).maybeSingle(); assertNoSupabaseError(error, "Read order"); return data ? orderFrom(data) : undefined;
}
export async function createOrder(data: Omit<OrderRow, "id" | "createdAt" | "status" | "supplierId" | "fulfillmentStatus" | "supplierTrackingNumber" | "supplierTrackingUrl" | "fulfillmentNotes">): Promise<OrderRow> {
  if (!isSupabaseConfigured()) return local.createOrder(data);
  const row: OrderRow = { ...data, id: crypto.randomUUID(), status: "pending", approvalStatus: "pending", approvedAt: null, approvedBy: null, supplierId: null, fulfillmentStatus: "not_ordered", supplierTrackingNumber: null, supplierTrackingUrl: null, fulfillmentNotes: null, createdAt: new Date().toISOString() };
  const { error } = await getSupabaseAdmin().from("orders").insert(orderTo(row)); assertNoSupabaseError(error, "Create order"); await logActivity("order_placed", `New order from ${row.customerName} — Rs ${row.total.toLocaleString()}`); return row;
}
export async function updateOrderStatus(id: string, status: string) {
  if (!isSupabaseConfigured()) return local.updateOrderStatus(id, status); const order = await getOrderById(id); if (!order) return undefined;
  const { error } = await getSupabaseAdmin().from("orders").update({ status }).eq("id", id); assertNoSupabaseError(error, "Update order status"); await logActivity("order_status_changed", `Order for ${order.customerName} marked as ${status}`); return { ...order, status };
}
export async function updateOrderApproval(id: string, approvalStatus: "approved" | "rejected") {
  if (!isSupabaseConfigured()) return local.updateOrderApproval(id, approvalStatus); const order = await getOrderById(id); if (!order) return undefined;
  const update = { approval_status: approvalStatus, approved_at: new Date().toISOString(), approved_by: "Store owner", ...(approvalStatus === "rejected" ? { status: "cancelled" } : {}) };
  const { error } = await getSupabaseAdmin().from("orders").update(update).eq("id", id); assertNoSupabaseError(error, "Update order approval"); await logActivity(approvalStatus === "approved" ? "order_approved" : "order_rejected", `Order for ${order.customerName} ${approvalStatus} by owner`); return { ...order, approvalStatus, approvedAt: update.approved_at, approvedBy: "Store owner", status: approvalStatus === "rejected" ? "cancelled" : order.status };
}
export async function updateOrderFulfillment(id: string, data: Partial<Pick<OrderRow, "supplierId" | "fulfillmentStatus" | "supplierTrackingNumber" | "supplierTrackingUrl" | "fulfillmentNotes">>) {
  if (!isSupabaseConfigured()) return local.updateOrderFulfillment(id, data); const order = await getOrderById(id); if (!order) return undefined;
  const update: Record<string, unknown> = {}; if ("supplierId" in data) update.supplier_id = data.supplierId; if ("fulfillmentStatus" in data) update.fulfillment_status = data.fulfillmentStatus; if ("supplierTrackingNumber" in data) update.supplier_tracking_number = data.supplierTrackingNumber; if ("supplierTrackingUrl" in data) update.supplier_tracking_url = data.supplierTrackingUrl; if ("fulfillmentNotes" in data) update.fulfillment_notes = data.fulfillmentNotes;
  const { error } = await getSupabaseAdmin().from("orders").update(update).eq("id", id); assertNoSupabaseError(error, "Update fulfillment"); if (data.fulfillmentStatus) await logActivity("order_fulfillment_updated", `Order for ${order.customerName} fulfillment set to ${data.fulfillmentStatus.replace(/_/g, " ")}`); return { ...order, ...data };
}

export async function getAllSuppliers(): Promise<SupplierRow[]> { if (!isSupabaseConfigured()) return local.getAllSuppliers(); return (await rows("suppliers")).map(supplierFrom); }
export async function getSupplierById(id: string) { if (!isSupabaseConfigured()) return local.getSupplierById(id); const { data, error } = await getSupabaseAdmin().from("suppliers").select("*").eq("id", id).maybeSingle(); assertNoSupabaseError(error, "Read supplier"); return data ? supplierFrom(data) : undefined; }
export async function createSupplier(data: Omit<SupplierRow, "id" | "createdAt">) { if (!isSupabaseConfigured()) return local.createSupplier(data); const row = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; const { error } = await getSupabaseAdmin().from("suppliers").insert(supplierTo(row)); assertNoSupabaseError(error, "Create supplier"); await logActivity("supplier_added", `Added supplier "${row.name}"`); return row; }
export async function updateSupplier(id: string, data: Omit<SupplierRow, "id" | "createdAt">) { if (!isSupabaseConfigured()) return local.updateSupplier(id, data); const existing = await getSupplierById(id); if (!existing) return undefined; const row = { ...existing, ...data }; const { error } = await getSupabaseAdmin().from("suppliers").update(supplierTo(row)).eq("id", id); assertNoSupabaseError(error, "Update supplier"); await logActivity("supplier_updated", `Updated supplier "${row.name}"`); return row; }
export async function deleteSupplier(id: string) { if (!isSupabaseConfigured()) return local.deleteSupplier(id); const existing = await getSupplierById(id); const { error } = await getSupabaseAdmin().from("suppliers").delete().eq("id", id); assertNoSupabaseError(error, "Delete supplier"); if (existing) await logActivity("supplier_deleted", `Deleted supplier "${existing.name}"`); }

export async function getAllReturnRequests(): Promise<ReturnRequestRow[]> { if (!isSupabaseConfigured()) return local.getAllReturnRequests(); return (await rows("returns")).map(returnFrom); }
export async function getReturnRequestById(id: string) { if (!isSupabaseConfigured()) return local.getReturnRequestById(id); const { data, error } = await getSupabaseAdmin().from("returns").select("*").eq("id", id).maybeSingle(); assertNoSupabaseError(error, "Read return"); return data ? returnFrom(data) : undefined; }
export async function createReturnRequest(data: Omit<ReturnRequestRow, "id" | "createdAt" | "status">) { if (!isSupabaseConfigured()) return local.createReturnRequest(data); const row: ReturnRequestRow = { ...data, id: crypto.randomUUID(), status: "requested", createdAt: new Date().toISOString() }; const { error } = await getSupabaseAdmin().from("returns").insert(returnTo(row)); assertNoSupabaseError(error, "Create return"); await logActivity("return_requested", `${row.customerName} requested a ${row.requestType} for "${row.itemName}"`); return row; }
export async function updateReturnRequestStatus(id: string, status: ReturnRequestStatus) { if (!isSupabaseConfigured()) return local.updateReturnRequestStatus(id, status); const row = await getReturnRequestById(id); if (!row) return undefined; const { error } = await getSupabaseAdmin().from("returns").update({ status }).eq("id", id); assertNoSupabaseError(error, "Update return"); await logActivity("return_status_changed", `Return for "${row.itemName}" marked as ${status}`); return { ...row, status }; }

export async function getAllCoupons(): Promise<CouponRow[]> { if (!isSupabaseConfigured()) return local.getAllCoupons(); return (await rows("coupons")).map(couponFrom); }
export async function getCouponByCode(code: string) { const target = code.trim().toUpperCase(); if (!isSupabaseConfigured()) return local.getCouponByCode(target); const { data, error } = await getSupabaseAdmin().from("coupons").select("*").eq("code", target).maybeSingle(); assertNoSupabaseError(error, "Read coupon"); return data ? couponFrom(data) : undefined; }
export async function createCoupon(data: Omit<CouponRow, "id" | "createdAt" | "usedCount">) { if (!isSupabaseConfigured()) return local.createCoupon(data); const row: CouponRow = { ...data, code: data.code.trim().toUpperCase(), id: crypto.randomUUID(), usedCount: 0, createdAt: new Date().toISOString() }; const { error } = await getSupabaseAdmin().from("coupons").insert(couponTo(row)); assertNoSupabaseError(error, "Create coupon"); await logActivity("coupon_added", `Added coupon code "${row.code}"`); return row; }
export async function updateCoupon(id: string, data: Omit<CouponRow, "id" | "createdAt" | "usedCount">) { if (!isSupabaseConfigured()) return local.updateCoupon(id, data); const current = (await getAllCoupons()).find((c) => c.id === id); if (!current) return undefined; const row = { ...current, ...data, code: data.code.trim().toUpperCase() }; const { error } = await getSupabaseAdmin().from("coupons").update(couponTo(row)).eq("id", id); assertNoSupabaseError(error, "Update coupon"); await logActivity("coupon_updated", `Updated coupon code "${row.code}"`); return row; }
export async function deleteCoupon(id: string) { if (!isSupabaseConfigured()) return local.deleteCoupon(id); const current = (await getAllCoupons()).find((c) => c.id === id); const { error } = await getSupabaseAdmin().from("coupons").delete().eq("id", id); assertNoSupabaseError(error, "Delete coupon"); if (current) await logActivity("coupon_deleted", `Deleted coupon code "${current.code}"`); }
export async function incrementCouponUsage(id: string) { if (!isSupabaseConfigured()) return local.incrementCouponUsage(id); const { error } = await getSupabaseAdmin().rpc("increment_coupon_usage", { coupon_id: id }); assertNoSupabaseError(error, "Increment coupon"); }
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> { const coupon = await getCouponByCode(code); if (!coupon) return { valid: false, error: "That code doesn't exist." }; if (!coupon.active) return { valid: false, error: "That code is no longer active." }; if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "That code has expired." }; if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { valid: false, error: "That code has reached its usage limit." }; const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal); return { valid: true, coupon, discount }; }

export async function getUserByEmail(email: string): Promise<UserRow | undefined> { const target = email.trim().toLowerCase(); if (!isSupabaseConfigured()) return local.getUserByEmail(target); const { data, error } = await getSupabaseAdmin().from("users").select("*").eq("email", target).maybeSingle(); assertNoSupabaseError(error, "Read user"); return data ? userFrom(data) : undefined; }
export async function getUserById(id: string): Promise<UserRow | undefined> { if (!isSupabaseConfigured()) return local.getUserById(id); const { data, error } = await getSupabaseAdmin().from("users").select("*").eq("id", id).maybeSingle(); assertNoSupabaseError(error, "Read user"); return data ? userFrom(data) : undefined; }
export async function findOrCreateUser(email: string, name: string, authProvider: "google" | "email") { if (!isSupabaseConfigured()) return local.findOrCreateUser(email, name, authProvider); const existing = await getUserByEmail(email); if (existing) return existing; const row: UserRow = { id: crypto.randomUUID(), name, email: email.trim().toLowerCase(), authProvider, addresses: [], createdAt: new Date().toISOString() }; const { error } = await getSupabaseAdmin().from("users").insert({ id: row.id, name: row.name, email: row.email, auth_provider: row.authProvider, addresses: row.addresses, created_at: row.createdAt }); if (error?.code === "23505") return (await getUserByEmail(email))!; assertNoSupabaseError(error, "Create user"); return row; }
export async function addUserAddress(userId: string, address: Omit<Address, "id">) { if (!isSupabaseConfigured()) return local.addUserAddress(userId, address); const user = await getUserById(userId); if (!user) return undefined; user.addresses.push({ ...address, id: crypto.randomUUID() }); const { error } = await getSupabaseAdmin().from("users").update({ addresses: user.addresses }).eq("id", userId); assertNoSupabaseError(error, "Add address"); return user; }
export async function deleteUserAddress(userId: string, addressId: string) { if (!isSupabaseConfigured()) return local.deleteUserAddress(userId, addressId); const user = await getUserById(userId); if (!user) return undefined; user.addresses = user.addresses.filter((a) => a.id !== addressId); const { error } = await getSupabaseAdmin().from("users").update({ addresses: user.addresses }).eq("id", userId); assertNoSupabaseError(error, "Delete address"); return user; }

function otpHash(email: string, code: string) { return crypto.createHash("sha256").update(`${email}:${code}`).digest("hex"); }
export async function createOtpCode(email: string): Promise<{ email: string; code: string }> { if (!isSupabaseConfigured()) return local.createOtpCode(email); const normalized = email.trim().toLowerCase(), code = crypto.randomInt(100000, 1000000).toString(), now = new Date(), expires = new Date(now.getTime() + 10 * 60 * 1000); const { error } = await getSupabaseAdmin().from("otp_codes").insert({ id: crypto.randomUUID(), email: normalized, code_hash: otpHash(normalized, code), used: false, expires_at: expires.toISOString(), created_at: now.toISOString() }); assertNoSupabaseError(error, "Create OTP"); await getSupabaseAdmin().from("otp_codes").delete().lt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()); return { email: normalized, code }; }
export async function verifyOtpCode(email: string, code: string) { if (!isSupabaseConfigured()) return local.verifyOtpCode(email, code); const normalized = email.trim().toLowerCase(); const { data, error } = await getSupabaseAdmin().from("otp_codes").select("*").eq("email", normalized).eq("used", false).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(10); assertNoSupabaseError(error, "Read OTP"); const target = otpHash(normalized, code.trim()), row = (data || []).find((item: any) => item.code_hash === target); if (!row) return false; const { error: updateError } = await getSupabaseAdmin().from("otp_codes").update({ used: true }).eq("id", row.id).eq("used", false); assertNoSupabaseError(updateError, "Consume OTP"); return true; }

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return local.getDashboardStats();
  const products = await getAllProductsAdmin(), orders = await getAllOrders(), suppliers = await getAllSuppliers(), returns = await getAllReturnRequests();
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0), today = new Date(); today.setHours(0, 0, 0, 0); const todayOrders = orders.filter((order) => new Date(order.createdAt) >= today);
  const days = [] as { date: string; label: string; revenue: number; orders: number }[]; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i); const next = new Date(d); next.setDate(next.getDate()+1); const matches = orders.filter((order) => { const time = new Date(order.createdAt); return time >= d && time < next; }); days.push({ date: d.toISOString(), label: d.toLocaleDateString("en-US", { weekday: "short" }), revenue: matches.reduce((sum, order) => sum + order.total, 0), orders: matches.length }); }
  const units: Record<string,{name:string;qty:number;revenue:number}> = {}; orders.forEach((order) => order.items.forEach((item) => { units[item.id] ||= { name:item.name,qty:0,revenue:0 }; units[item.id].qty += item.qty; units[item.id].revenue += item.qty*item.price; }));
  return { totalRevenue, totalOrders: orders.length, ordersToday: todayOrders.length, revenueToday: todayOrders.reduce((sum, order) => sum + order.total, 0), pendingOrders: orders.filter((order) => order.status === "pending").length, awaitingSupplierOrder: orders.filter((order) => order.fulfillmentStatus === "not_ordered").length, pendingReturns: returns.filter((item) => item.status === "requested").length, lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length, outOfStock: products.filter((p) => p.stock <= 0).length, totalProducts: products.length, totalSuppliers: suppliers.length, chartData: days, topProducts: Object.values(units).sort((a,b)=>b.qty-a.qty).slice(0,5) };
}

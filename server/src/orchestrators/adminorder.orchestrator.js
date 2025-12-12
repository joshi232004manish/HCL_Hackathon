import { adminService } from "../services/admin.service.js";
import { orderService } from "../services/order.service.js";

export const adminOrderOrchestrator = {
  getAllOrdersForAdmin: async (adminId) => {
    // 1. Validate admin
    const isAdmin = await adminService.isAdmin(adminId);
    if (!isAdmin) return { error: "Access denied. Admins only.", status: 403 };

    // 2. Fetch orders
    const orders = await orderService.fetchAllOrders();
    return { data: orders, status: 200 };
  },

  updateOrderStatus: async (adminId, orderId, body) => {
    // Validate admin
    const isAdmin = await adminService.isAdmin(adminId);
    if (!isAdmin) return { error: "Access denied. Admins only.", status: 403 };

    // Validate status
    const validStatuses = [
      "Pending", "Processing", "Out For Delivery",
      "Delivered", "Cancelled", "Other"
    ];

    if (body.status && !validStatuses.includes(body.status)) {
      return { error: "Invalid status value.", status: 400 };
    }

    // Update order
    const updated = await orderService.updateStatus(orderId, body);

    if (!updated) return { error: "Order not found.", status: 404 };

    return {
      data: updated,
      status: 200,
      message: "Order status updated successfully",
    };
  },
};

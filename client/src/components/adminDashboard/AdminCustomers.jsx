import React from "react";

const AdminCustomers = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">Customers Management</h2>
          <p className="text-sm text-(--color-secondary)">
            View and manage customer accounts and statuses.
          </p>
        </div>
      </div>
      {/* Placeholder for Customers Table (consumes GET /admin/customers, PATCH /admin/customers/:id/status) */}
    </div>
  );
};

export default AdminCustomers;

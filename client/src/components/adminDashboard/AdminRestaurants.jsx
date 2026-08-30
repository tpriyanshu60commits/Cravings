import React from "react";

const AdminRestaurants = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">Restaurants Management</h2>
          <p className="text-sm text-(--color-secondary)">
            Verify restaurant documents, approve or suspend partners.
          </p>
        </div>
      </div>
      {/* Placeholder for Restaurants Table (consumes GET /admin/restaurants, PATCH /admin/restaurants/:id/status) */}
    </div>
  );
};

export default AdminRestaurants;

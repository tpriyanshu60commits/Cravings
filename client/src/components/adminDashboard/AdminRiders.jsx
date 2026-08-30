import React from "react";

const AdminRiders = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">Riders Management</h2>
          <p className="text-sm text-(--color-secondary)">
            Verify driver KYC documents, view earnings, and manage statuses.
          </p>
        </div>
      </div>
      {/* Placeholder for Riders Table (consumes GET /admin/riders, PATCH /admin/riders/:id/status) */}
    </div>
  );
};

export default AdminRiders;

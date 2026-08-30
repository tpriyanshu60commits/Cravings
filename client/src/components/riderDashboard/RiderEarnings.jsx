import React from "react";

const RiderEarnings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">My Earnings</h2>
          <p className="text-sm text-(--color-secondary)">
            View payout history and delivery earnings.
          </p>
        </div>
      </div>
      {/* Placeholder for Earnings summary & history table (consumes GET /rider/earnings) */}
    </div>
  );
};

export default RiderEarnings;

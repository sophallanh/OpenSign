import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  pending: "bg-warning",
  approved: "bg-info",
  paid: "bg-success"
};

/**
 * Displays three summary cards: total commissions, total amount, and paid amount.
 */
const CommissionStats = ({ commissions }) => {
  const { t } = useTranslation();

  const total = commissions.length;
  const totalAmount = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const paidAmount = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const pendingCount = commissions.filter((c) => c.status === "pending").length;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const cards = [
    {
      icon: "fa-light fa-file-invoice-dollar",
      label: t("commission.total-records", "Total Commissions"),
      value: total,
      bgColor: "op-bg-primary"
    },
    {
      icon: "fa-light fa-dollar-sign",
      label: t("commission.total-amount", "Total Commission Amount"),
      value: formatCurrency(totalAmount),
      bgColor: "op-bg-secondary"
    },
    {
      icon: "fa-light fa-check-circle",
      label: t("commission.paid-amount", "Paid Out"),
      value: formatCurrency(paidAmount),
      bgColor: "bg-[#2ed8b6]"
    },
    {
      icon: "fa-light fa-hourglass-half",
      label: t("commission.pending-count", "Pending Approval"),
      value: pendingCount,
      bgColor: "bg-[#FF5370]"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} op-card w-full h-[130px] px-4 pt-4 shadow-md`}
        >
          <div className="flex items-center gap-4 text-white">
            <span className="rounded-full bg-base-300 bg-opacity-20 w-[55px] h-[55px] flex justify-center items-center shrink-0">
              <i className={`${card.icon} text-[24px]`}></i>
            </span>
            <div className="font-medium">
              <div className="text-sm opacity-90">{card.label}</div>
              <div className="text-2xl font-light mt-1">{card.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { STATUS_COLORS };
export default CommissionStats;

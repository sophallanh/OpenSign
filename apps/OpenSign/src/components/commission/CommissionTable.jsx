import { useState } from "react";
import { useTranslation } from "react-i18next";
import { STATUS_COLORS } from "./CommissionStats";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid"
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0
  );

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

/**
 * Table listing commission records with edit and delete actions.
 */
const CommissionTable = ({ commissions, onEdit, onDelete, isLoading }) => {
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState(null);

  const handleDeleteClick = (objectId) => {
    setConfirmId(objectId);
  };

  const handleConfirmDelete = () => {
    onDelete(confirmId);
    setConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!commissions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content opacity-50">
        <i className="fa-light fa-file-invoice-dollar text-[50px]"></i>
        <p className="text-lg">{t("commission.no-records", "No commission records yet.")}</p>
        <p className="text-sm">{t("commission.no-records-hint", "Add your first commission using the button above.")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="op-card bg-base-100 shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-3 text-base-content">
              {t("commission.confirm-delete", "Delete Commission?")}
            </h3>
            <p className="text-sm text-base-content opacity-70 mb-5">
              {t("commission.confirm-delete-msg", "This action cannot be undone.")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="op-btn op-btn-ghost op-btn-sm"
                onClick={() => setConfirmId(null)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                className="op-btn op-btn-error op-btn-sm"
                onClick={handleConfirmDelete}
              >
                {t("delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="op-table w-full text-sm">
          <thead>
            <tr className="text-base-content">
              <th>{t("commission.col-partner", "Referral Partner")}</th>
              <th>{t("commission.col-email", "Email")}</th>
              <th>{t("commission.col-loan-amount", "Loan Amount")}</th>
              <th>{t("commission.col-rate", "Rate (%)")}</th>
              <th>{t("commission.col-commission", "Commission")}</th>
              <th>{t("commission.col-status", "Status")}</th>
              <th>{t("commission.col-date", "Created")}</th>
              <th>{t("commission.col-actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((row) => (
              <tr key={row.objectId} className="hover:bg-base-200 transition-colors">
                <td className="font-medium">{row.referralPartner}</td>
                <td className="text-xs opacity-70">{row.referralEmail}</td>
                <td>{formatCurrency(row.loanAmount)}</td>
                <td>{row.commissionRate != null ? `${row.commissionRate}%` : "—"}</td>
                <td className="font-semibold">{formatCurrency(row.commissionAmount)}</td>
                <td>
                  <span
                    className={`op-badge text-white text-xs ${
                      STATUS_COLORS[row.status] || "bg-base-300"
                    }`}
                  >
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </td>
                <td className="text-xs opacity-70">
                  {formatDate(row.createdAt)}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      title={t("edit", "Edit")}
                      className="op-btn op-btn-ghost op-btn-xs"
                      onClick={() => onEdit(row)}
                    >
                      <i className="fa-light fa-pen text-info"></i>
                    </button>
                    <button
                      title={t("delete", "Delete")}
                      className="op-btn op-btn-ghost op-btn-xs"
                      onClick={() => handleDeleteClick(row.objectId)}
                    >
                      <i className="fa-light fa-trash text-error"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CommissionTable;

import { useState, useEffect, useCallback } from "react";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import CommissionStats from "../components/commission/CommissionStats";
import CommissionTable from "../components/commission/CommissionTable";
import CommissionModal from "../components/commission/CommissionModal";
import Alert from "../primitives/Alert";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" }
];

const CommissionDashboard = () => {
  const { t } = useTranslation();
  const [commissions, setCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState({ type: "success", msg: "" });

  const showAlert = (type, msg) => {
    // Alert component uses "danger" for errors
    const alertType = type === "error" ? "danger" : type;
    setAlert({ type: alertType, msg });
    setTimeout(() => setAlert({ type: "success", msg: "" }), 4000);
  };

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await Parse.Cloud.run("getcommissions", {
        skip: 0,
        limit: 200
      });
      setCommissions(result?.results || []);
    } catch (err) {
      console.error("fetchCommissions:", err);
      showAlert("error", err.message || t("commission.fetch-error", "Failed to load commissions."));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // Apply client-side filters
  useEffect(() => {
    let filtered = commissions;
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.referralPartner || "").toLowerCase().includes(lower) ||
          (c.referralEmail || "").toLowerCase().includes(lower) ||
          (c.notes || "").toLowerCase().includes(lower)
      );
    }
    setFilteredCommissions(filtered);
  }, [commissions, statusFilter, searchTerm]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await Parse.Cloud.run("savecommission", formData);
      setIsModalOpen(false);
      setEditingRecord(null);
      await fetchCommissions();
      showAlert(
        "success",
        formData.objectId
          ? t("commission.updated", "Commission updated successfully.")
          : t("commission.created", "Commission added successfully.")
      );
    } catch (err) {
      console.error("saveCommission:", err);
      showAlert("error", err.message || t("commission.save-error", "Failed to save commission."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (objectId) => {
    try {
      await Parse.Cloud.run("deletecommission", { objectId });
      await fetchCommissions();
      showAlert("success", t("commission.deleted", "Commission deleted successfully."));
    } catch (err) {
      console.error("deleteCommission:", err);
      showAlert("error", err.message || t("commission.delete-error", "Failed to delete commission."));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <i className="fa-light fa-file-invoice-dollar text-primary"></i>
            {t("commission.title", "Commission Tracking")}
          </h1>
          <p className="text-sm text-base-content opacity-60 mt-1">
            {t("commission.subtitle", "Track referral commissions from loan signings")}
          </p>
        </div>
        <button className="op-btn op-btn-primary gap-2 self-start sm:self-auto" onClick={handleAddNew}>
          <i className="fa-light fa-plus"></i>
          {t("commission.add-btn", "Add Commission")}
        </button>
      </div>

      {/* Alert */}
      {alert.msg && (
        <Alert type={alert.type}>{alert.msg}</Alert>
      )}

      {/* Summary stats */}
      <CommissionStats commissions={commissions} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="fa-light fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content opacity-40"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("commission.search-placeholder", "Search by partner or email...")}
            className="op-input op-input-bordered w-full pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`op-btn op-btn-sm ${
                statusFilter === opt.value ? "op-btn-primary" : "op-btn-ghost"
              }`}
            >
              {t(`commission.filter-${opt.value}`, opt.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Commission table */}
      <div className="op-card bg-base-100 shadow-md">
        <div className="op-card-body p-0 pt-2">
          <CommissionTable
            commissions={filteredCommissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Add / Edit modal */}
      <CommissionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initial={editingRecord}
        isSaving={isSaving}
      />
    </div>
  );
};

export default CommissionDashboard;

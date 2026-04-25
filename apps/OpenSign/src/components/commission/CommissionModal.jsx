import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const STATUSES = ["pending", "approved", "paid"];

const emptyForm = {
  referralPartner: "",
  referralEmail: "",
  loanAmount: "",
  commissionRate: "",
  commissionAmount: "",
  status: "pending",
  notes: ""
};

/**
 * Modal for creating or editing a commission record.
 * Automatically calculates commissionAmount when loanAmount or commissionRate changes.
 */
const CommissionModal = ({ isOpen, onClose, onSave, initial, isSaving }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              referralPartner: initial.referralPartner || "",
              referralEmail: initial.referralEmail || "",
              loanAmount: initial.loanAmount != null ? String(initial.loanAmount) : "",
              commissionRate: initial.commissionRate != null ? String(initial.commissionRate) : "",
              commissionAmount: initial.commissionAmount != null ? String(initial.commissionAmount) : "",
              status: initial.status || "pending",
              notes: initial.notes || ""
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [isOpen, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate commission amount
      if (name === "loanAmount" || name === "commissionRate") {
        const loan = parseFloat(name === "loanAmount" ? value : prev.loanAmount);
        const rate = parseFloat(name === "commissionRate" ? value : prev.commissionRate);
        if (!isNaN(loan) && !isNaN(rate)) {
          updated.commissionAmount = ((loan * rate) / 100).toFixed(2);
        }
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.referralPartner.trim()) errs.referralPartner = t("commission.err-partner", "Partner name is required.");
    if (!form.referralEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.referralEmail)) {
      errs.referralEmail = t("commission.err-email", "A valid email is required.");
    }
    if (form.loanAmount === "" || isNaN(Number(form.loanAmount)) || Number(form.loanAmount) < 0) {
      errs.loanAmount = t("commission.err-loan", "Enter a valid loan amount.");
    }
    if (form.commissionRate === "" || isNaN(Number(form.commissionRate)) || Number(form.commissionRate) < 0 || Number(form.commissionRate) > 100) {
      errs.commissionRate = t("commission.err-rate", "Rate must be between 0 and 100.");
    }
    if (form.commissionAmount === "" || isNaN(Number(form.commissionAmount)) || Number(form.commissionAmount) < 0) {
      errs.commissionAmount = t("commission.err-commission", "Enter a valid commission amount.");
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      ...(initial?.objectId ? { objectId: initial.objectId } : {}),
      referralPartner: form.referralPartner.trim(),
      referralEmail: form.referralEmail.trim().toLowerCase(),
      loanAmount: Number(form.loanAmount),
      commissionRate: Number(form.commissionRate),
      commissionAmount: Number(form.commissionAmount),
      status: form.status,
      notes: form.notes
    });
  };

  if (!isOpen) return null;

  const Field = ({ label, name, type = "text", min, max, step, placeholder, required }) => (
    <div className="form-control w-full">
      <label className="label pb-1">
        <span className="label-text font-medium text-base-content">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={`op-input op-input-bordered w-full ${errors[name] ? "op-input-error" : ""}`}
      />
      {errors[name] && (
        <label className="label pt-1">
          <span className="label-text-alt text-error">{errors[name]}</span>
        </label>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="op-card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="op-card-body gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-base-content">
              {initial
                ? t("commission.edit-title", "Edit Commission")
                : t("commission.add-title", "Add Commission")}
            </h3>
            <button className="op-btn op-btn-ghost op-btn-sm op-btn-circle" onClick={onClose}>
              <i className="fa-light fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label={t("commission.field-partner", "Referral Partner")}
              name="referralPartner"
              placeholder="John Smith"
              required
            />
            <Field
              label={t("commission.field-email", "Partner Email")}
              name="referralEmail"
              type="email"
              placeholder="partner@example.com"
              required
            />
            <Field
              label={t("commission.field-loan", "Loan Amount ($)")}
              name="loanAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="250000"
              required
            />
            <Field
              label={t("commission.field-rate", "Commission Rate (%)")}
              name="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="1.5"
              required
            />
            <Field
              label={t("commission.field-commission", "Commission Amount ($)")}
              name="commissionAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Auto-calculated"
              required
            />
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium text-base-content">
                  {t("commission.field-status", "Status")}
                  <span className="text-error ml-1">*</span>
                </span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="op-select op-select-bordered w-full"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium text-base-content">
                {t("commission.field-notes", "Notes (optional)")}
              </span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder={t("commission.notes-placeholder", "Add any relevant notes...")}
              className="op-textarea op-textarea-bordered w-full resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="op-btn op-btn-ghost" onClick={onClose} disabled={isSaving}>
              {t("cancel", "Cancel")}
            </button>
            <button
              className="op-btn op-btn-primary"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : initial ? (
                t("save-changes", "Save Changes")
              ) : (
                t("commission.add-btn", "Add Commission")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;

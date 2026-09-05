import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Filter,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import { useResourceList } from "../hooks/useResourceHooks";
import { updatePayment } from "../services/paymentService.js";

const STATUS_OPTIONS = [
  "All",
  "Paid",
  "Success",
  "Pending",
  "Cancelled",
  "Failed",
];
const METHOD_OPTIONS = [
  "All",
  "Cash",
  "UPI",
  "Card",
  "Net Banking",
  "Cheque",
  "Bank Transfer",
  "Payment Link",
];
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const paymentDate = (payment) =>
  (payment.paidAt || payment.date || payment.createdAt || "").slice(0, 10);

function statusClass(status) {
  if (status === "Paid" || status === "Success")
    return "bg-emerald-100 text-emerald-700";
  if (status === "Cancelled" || status === "Failed")
    return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function getStudentLabel(payment, students) {
  const student = students.find(
    (item) => String(item.id) === String(payment.studentId),
  );
  return (
    payment.studentName ||
    student?.name ||
    student?.fullName ||
    payment.studentId ||
    "Unknown student"
  );
}

export default function FeeUpdatePage() {
  const queryClient = useQueryClient();
  const { data: paymentsData, isLoading: paymentsLoading } = useResourceList(
    "payments",
    { page: 1, pageSize: 500 },
  );
  const { data: studentsData } = useResourceList("students", {
    page: 1,
    pageSize: 500,
  });
  const payments = useMemo(() => paymentsData?.items || [], [paymentsData]);
  const students = useMemo(() => studentsData?.items || [], [studentsData]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [notice, setNotice] = useState("");
  const [editForm, setEditForm] = useState(null);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const searchable = [
        payment.receiptNumber,
        payment.paymentId,
        payment.studentId,
        getStudentLabel(payment, students),
        payment.metadata?.chargeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const date = paymentDate(payment);
      return (
        (!term || searchable.includes(term)) &&
        (status === "All" || payment.status === status) &&
        (method === "All" ||
          (payment.method || payment.paymentMethod) === method) &&
        (!fromDate || date >= fromDate) &&
        (!toDate || date <= toDate)
      );
    });
  }, [fromDate, method, payments, search, status, students, toDate]);

  const summary = useMemo(
    () =>
      filteredPayments.reduce(
        (result, payment) => {
          if (payment.status === "Paid" || payment.status === "Success")
            result.collected += Number(payment.amount || 0);
          if (payment.status === "Pending")
            result.pending += Number(payment.amount || 0);
          result.count += 1;
          return result;
        },
        { collected: 0, pending: 0, count: 0 },
      ),
    [filteredPayments],
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePayment(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setSelectedPayment(updated);
      setNotice("Fee record updated successfully and audit logged.");
      setEditForm(null);
    },
    onError: (error) =>
      setNotice(error?.message || "Fee record could not be updated."),
  });

  const openEditor = (payment) => {
    setSelectedPayment(payment);
    setEditForm({
      amount: payment.amount ?? "",
      status: payment.status || "Paid",
      method: payment.method || payment.paymentMethod || "Cash",
      reference: payment.reference || payment.gatewayReference || "",
      notes: payment.notes || "",
    });
    setNotice("");
  };

  const saveEdit = (event) => {
    event.preventDefault();
    if (!selectedPayment || !editForm || Number(editForm.amount) <= 0) {
      setNotice("Enter a valid amount before saving.");
      return;
    }
    updateMutation.mutate({
      id: selectedPayment.id,
      payload: {
        ...selectedPayment,
        amount: Number(editForm.amount),
        status: editForm.status,
        method: editForm.method,
        reference: editForm.reference,
        notes: editForm.notes,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setMethod("All");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader
        title="Fee update"
        subtitle="Fee desk / Update and reconcile payment records"
        action={
          <button
            type="button"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["payments"] })
            }
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filtered records
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {summary.count}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Showing matching fee entries
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Collected amount
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {money(summary.collected)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Paid and successful records
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending amount
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {money(summary.pending)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting reconciliation</p>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 size={17} /> {notice}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Filter size={18} /> Filter fee records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Search and narrow the complete payment ledger.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Clear filters
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search fee records</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student / receipt"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </label>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option}>
                {option === "All" ? "All statuses" : option}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by payment mode"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option}>
                {option === "All" ? "All payment modes" : option}
              </option>
            ))}
          </select>
          <label className="relative">
            <CalendarDays
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />
            <input
              aria-label="From date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </label>
          <label className="relative">
            <CalendarDays
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />
            <input
              aria-label="To date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3">Receipt / payment ID</th>
                <th className="pb-3">Student</th>
                <th className="pb-3">Fee type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Mode</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    <LoaderCircle
                      className="mx-auto mb-2 animate-spin"
                      size={20}
                    />
                    Loading fee records...
                  </td>
                </tr>
              ) : filteredPayments.length ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 font-semibold text-slate-800">
                      {payment.receiptNumber || payment.paymentId || payment.id}
                    </td>
                    <td className="py-3 text-slate-600">
                      {getStudentLabel(payment, students)}
                    </td>
                    <td className="py-3 text-slate-600">
                      {payment.metadata?.chargeType ||
                        (payment.metadata?.source === "miscellaneous-fee"
                          ? "Miscellaneous"
                          : "Regular fee")}
                    </td>
                    <td className="py-3 text-slate-600">
                      {paymentDate(payment) || "N/A"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {payment.method || payment.paymentMethod || "Cash"}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {money(payment.amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(payment.status)}`}
                      >
                        {payment.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => openEditor(payment)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                      >
                        <Edit3 size={14} /> Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No fee records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editForm && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Update fee record
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedPayment.receiptNumber ||
                    selectedPayment.paymentId ||
                    selectedPayment.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close update form"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveEdit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Amount
                  <input
                    required
                    min="1"
                    type="number"
                    value={editForm.amount}
                    onChange={(event) =>
                      setEditForm({ ...editForm, amount: event.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Status
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm({ ...editForm, status: event.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500"
                  >
                    {STATUS_OPTIONS.filter((option) => option !== "All").map(
                      (option) => (
                        <option key={option}>{option}</option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Payment mode
                <select
                  value={editForm.method}
                  onChange={(event) =>
                    setEditForm({ ...editForm, method: event.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500"
                >
                  {METHOD_OPTIONS.filter((option) => option !== "All").map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Reference
                <input
                  value={editForm.reference}
                  onChange={(event) =>
                    setEditForm({ ...editForm, reference: event.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Notes
                <textarea
                  rows="3"
                  value={editForm.notes}
                  onChange={(event) =>
                    setEditForm({ ...editForm, notes: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-emerald-500"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {updateMutation.isPending && (
                    <LoaderCircle size={15} className="animate-spin" />
                  )}
                  Save update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

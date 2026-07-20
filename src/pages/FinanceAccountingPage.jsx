import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceList } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { calculateTrialBalance, createChartOfAccount } from '../services/financeService.js';
import { summarizeLedger, createLedgerEntry, approveLedgerEntry } from '../services/ledgerService.js';
import { createVoucher, postVoucher, buildVoucherSummary } from '../services/voucherService.js';
import { createBudget, calculateBudgetVariance } from '../services/budgetService.js';
import { createBankAccount, getBankBalance } from '../services/bankService.js';

const defaults = {
  name: '',
  type: 'Assets',
  group: 'Current Assets',
  openingBalance: 0,
  accountCode: '',
  debit: 0,
  credit: 0,
  amount: 0,
  voucherType: 'Journal Voucher',
  status: 'Draft',
  period: '',
};

export default function FinanceAccountingPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [form, setForm] = useState(defaults);
  const [busyMessage, setBusyMessage] = useState('');

  const { data: accountsData } = useResourceList('chartOfAccounts', { page: 1, pageSize: 200 });
  const { data: ledgerData } = useResourceList('journalEntries', { page: 1, pageSize: 200 });
  const { data: vouchersData } = useResourceList('vouchers', { page: 1, pageSize: 200 });
  const { data: budgetsData } = useResourceList('budgets', { page: 1, pageSize: 200 });
  const { data: banksData } = useResourceList('bankAccounts', { page: 1, pageSize: 200 });

  const accounts = accountsData?.items || [];
  const entries = ledgerData?.items || [];
  const vouchers = vouchersData?.items || [];
  const budgets = budgetsData?.items || [];
  const bankAccounts = banksData?.items || [];

  const trialBalance = useMemo(() => calculateTrialBalance(accounts, entries), [accounts, entries]);
  const ledgerSummary = useMemo(() => summarizeLedger(entries), [entries]);
  const voucherSummary = useMemo(() => buildVoucherSummary(vouchers), [vouchers]);
  const bankBalance = useMemo(() => getBankBalance(bankAccounts), [bankAccounts]);

  const filteredAccounts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return accounts.filter((account) => [account.name, account.type, account.group, account.accountCode].filter(Boolean).some((value) => String(value).toLowerCase().includes(search)));
  }, [accounts, searchTerm]);

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving account…');
    await createChartOfAccount({
      name: form.name,
      type: form.type,
      group: form.group,
      accountCode: form.accountCode || `ACC-${Date.now()}`,
      openingBalance: Number(form.openingBalance || 0),
    });
    queryClient.invalidateQueries(['chartOfAccounts']);
    setBusyMessage('');
    setIsAccountModalOpen(false);
    setForm(defaults);
  };

  const handleEntrySubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Posting journal entry…');
    await createLedgerEntry({
      description: form.name,
      debit: Number(form.debit || 0),
      credit: Number(form.credit || 0),
      accountId: form.accountCode,
      status: 'Posted',
      period: form.period,
    });
    queryClient.invalidateQueries(['journalEntries']);
    setBusyMessage('');
    setIsEntryModalOpen(false);
    setForm(defaults);
  };

  const handleVoucherSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Preparing voucher…');
    await createVoucher({
      voucherType: form.voucherType,
      amount: Number(form.amount || 0),
      status: 'Draft',
      date: form.period,
      prefix: form.voucherType === 'Receipt Voucher' ? 'RV' : form.voucherType === 'Payment Voucher' ? 'PV' : 'JV',
      sequence: vouchers.length + 1,
    });
    queryClient.invalidateQueries(['vouchers']);
    setBusyMessage('');
    setIsVoucherModalOpen(false);
    setForm(defaults);
  };

  const handleBudgetSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving budget…');
    await createBudget({
      name: form.name,
      amount: Number(form.amount || 0),
      period: form.period,
      department: form.group,
    });
    queryClient.invalidateQueries(['budgets']);
    setBusyMessage('');
    setIsBudgetModalOpen(false);
    setForm(defaults);
  };

  const handleBankSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving bank account…');
    await createBankAccount({ name: form.name, balance: Number(form.openingBalance || 0), accountCode: form.accountCode || `BNK-${Date.now()}` });
    queryClient.invalidateQueries(['bankAccounts']);
    setBusyMessage('');
    setIsBankModalOpen(false);
    setForm(defaults);
  };

  const approveEntry = async (entry) => {
    await approveLedgerEntry(entry.id, { remarks: 'Approved from finance module' });
    queryClient.invalidateQueries(['journalEntries']);
  };

  const postVoucherEntry = async (voucher) => {
    await postVoucher(voucher.id);
    queryClient.invalidateQueries(['vouchers']);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Finance & accounting"
        subtitle="Chart of accounts, ledger posting, vouchers, banks, budget controls, and management reports."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setIsAccountModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200">Add account</button>
            <button type="button" onClick={() => setIsEntryModalOpen(true)} className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950">Post entry</button>
            <button type="button" onClick={() => setIsVoucherModalOpen(true)} className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Create voucher</button>
          </div>
        }
      />

      {busyMessage ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{busyMessage}</div> : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['overview', 'accounts', 'ledger', 'vouchers', 'budget', 'bank', 'reports'].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveSection(tab)} className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${activeSection === tab ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'accounts' ? 'Chart of Accounts' : tab === 'ledger' ? 'Ledger' : tab === 'vouchers' ? 'Vouchers' : tab === 'budget' ? 'Budget' : tab === 'bank' ? 'Bank' : 'Reports'}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today’s collection</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0).toLocaleString()}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today’s payments</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0).toLocaleString()}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Cash balance</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{bankBalance.toLocaleString()}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Monthly revenue</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{voucherSummary.amount.toLocaleString()}</p></div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Finance integrations</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">Student fees</div>
              <div className="rounded-2xl bg-slate-50 p-3">Payroll</div>
              <div className="rounded-2xl bg-slate-50 p-3">Hostel fees</div>
              <div className="rounded-2xl bg-slate-50 p-3">Transport fees</div>
              <div className="rounded-2xl bg-slate-50 p-3">Library fines</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search accounts" className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
            <button type="button" onClick={() => setIsAccountModalOpen(true)} className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">New account</button>
          </div>
          <DataTable columns={[
            { label: 'Account', key: 'name', sortable: true },
            { label: 'Code', key: 'accountCode', sortable: true },
            { label: 'Type', key: 'type', sortable: true },
            { label: 'Group', key: 'group', sortable: true },
            { label: 'Opening balance', key: 'openingBalance', sortable: true, render: (value) => `₹${Number(value || 0).toLocaleString()}` },
          ]} rows={filteredAccounts} initialPageSize={8} placeholder="Search chart of accounts" />
        </div>
      )}

      {activeSection === 'ledger' && (
        <div className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Ledger summary</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Entries</p><p className="mt-3 text-2xl font-semibold text-slate-950">{ledgerSummary.entries}</p></div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Debit</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{ledgerSummary.totalDebit.toLocaleString()}</p></div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Credit</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{ledgerSummary.totalCredit.toLocaleString()}</p></div>
            </div>
          </div>
          <DataTable columns={[
            { label: 'Description', key: 'description', sortable: true },
            { label: 'Debit', key: 'debit', sortable: true, render: (value) => `₹${Number(value || 0).toLocaleString()}` },
            { label: 'Credit', key: 'credit', sortable: true, render: (value) => `₹${Number(value || 0).toLocaleString()}` },
            { label: 'Status', key: 'status', sortable: true, render: (value) => <StatusBadge status={value} /> },
            { label: 'Action', key: 'action', sortable: false, render: (_value, row) => <button type="button" onClick={() => approveEntry(row)} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs">Approve</button> },
          ]} rows={entries} initialPageSize={8} placeholder="Search ledger" />
        </div>
      )}

      {activeSection === 'vouchers' && (
        <div className="space-y-4">
          <DataTable columns={[
            { label: 'Voucher', key: 'voucherType', sortable: true },
            { label: 'Amount', key: 'amount', sortable: true, render: (value) => `₹${Number(value || 0).toLocaleString()}` },
            { label: 'Status', key: 'status', sortable: true, render: (value) => <StatusBadge status={value} /> },
            { label: 'Action', key: 'action', sortable: false, render: (_value, row) => <button type="button" onClick={() => postVoucherEntry(row)} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs">Post</button> },
          ]} rows={vouchers} initialPageSize={8} placeholder="Search vouchers" />
        </div>
      )}

      {activeSection === 'budget' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Budgets</h3>
            <div className="mt-4 space-y-3">
              {budgets.map((budget) => {
                const variance = calculateBudgetVariance(budget, Number(budget.amount || 0));
                return <div key={budget.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-slate-900">{budget.name}</p><span className="rounded-full bg-white px-3 py-1 text-sm">{variance.status}</span></div><p className="mt-2 text-sm text-slate-600">Planned ₹{Number(budget.amount || 0).toLocaleString()} · Variance ₹{variance.variance.toLocaleString()}</p></div>;
              })}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Budget controls</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">Department budgets</div>
              <div className="rounded-2xl bg-slate-50 p-3">Annual budgets</div>
              <div className="rounded-2xl bg-slate-50 p-3">Variance analysis</div>
              <div className="rounded-2xl bg-slate-50 p-3">Forecasting</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'bank' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Bank accounts</h3>
            <div className="mt-4 space-y-3">
              {bankAccounts.map((account) => <div key={account.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{account.name}</p><p className="mt-2 text-sm text-slate-600">Balance ₹{Number(account.balance || 0).toLocaleString()} · {account.accountCode}</p></div>)}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Bank operations</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">Reconciliation</div>
              <div className="rounded-2xl bg-slate-50 p-3">Deposits</div>
              <div className="rounded-2xl bg-slate-50 p-3">Withdrawals</div>
              <div className="rounded-2xl bg-slate-50 p-3">Transfers</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'reports' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Financial reports</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">Trial balance</div>
              <div className="rounded-2xl bg-slate-50 p-3">Balance sheet</div>
              <div className="rounded-2xl bg-slate-50 p-3">Profit & loss</div>
              <div className="rounded-2xl bg-slate-50 p-3">Cash book</div>
              <div className="rounded-2xl bg-slate-50 p-3">Bank book</div>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Trial balance</h3>
            <div className="mt-4 space-y-3">
              {trialBalance.map((account) => <div key={account.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-slate-900">{account.name}</p><span className="rounded-full bg-white px-3 py-1 text-sm">₹{Number(account.balance || 0).toLocaleString()}</span></div></div>)}
            </div>
          </div>
        </div>
      )}

      <Modal title="Add account" isOpen={isAccountModalOpen} onClose={() => { setIsAccountModalOpen(false); setForm(defaults); }} footer={<button type="button" onClick={handleAccountSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save account</button>}>
        <form className="space-y-4" onSubmit={handleAccountSubmit}>
          <FormField label="Account name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Account code"><input value={form.accountCode} onChange={(event) => setForm((current) => ({ ...current, accountCode: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Type"><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"><option>Assets</option><option>Liabilities</option><option>Income</option><option>Expense</option><option>Equity</option></select></FormField>
            <FormField label="Group"><input value={form.group} onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          </div>
          <FormField label="Opening balance"><input type="number" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Post journal entry" isOpen={isEntryModalOpen} onClose={() => { setIsEntryModalOpen(false); setForm(defaults); }} footer={<button type="button" onClick={handleEntrySubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Post entry</button>}>
        <form className="space-y-4" onSubmit={handleEntrySubmit}>
          <FormField label="Description"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Account code"><input value={form.accountCode} onChange={(event) => setForm((current) => ({ ...current, accountCode: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Debit"><input type="number" value={form.debit} onChange={(event) => setForm((current) => ({ ...current, debit: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="Credit"><input type="number" value={form.credit} onChange={(event) => setForm((current) => ({ ...current, credit: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <FormField label="Period"><input type="month" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Create voucher" isOpen={isVoucherModalOpen} onClose={() => { setIsVoucherModalOpen(false); setForm(defaults); }} footer={<button type="button" onClick={handleVoucherSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Create voucher</button>}>
        <form className="space-y-4" onSubmit={handleVoucherSubmit}>
          <FormField label="Voucher type"><select value={form.voucherType} onChange={(event) => setForm((current) => ({ ...current, voucherType: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"><option>Receipt Voucher</option><option>Payment Voucher</option><option>Journal Voucher</option><option>Contra Voucher</option></select></FormField>
          <FormField label="Amount"><input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Date"><input type="date" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Create budget" isOpen={isBudgetModalOpen} onClose={() => { setIsBudgetModalOpen(false); setForm(defaults); }} footer={<button type="button" onClick={handleBudgetSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save budget</button>}>
        <form className="space-y-4" onSubmit={handleBudgetSubmit}>
          <FormField label="Budget name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Amount"><input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Department"><input value={form.group} onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Period"><input type="month" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Add bank account" isOpen={isBankModalOpen} onClose={() => { setIsBankModalOpen(false); setForm(defaults); }} footer={<button type="button" onClick={handleBankSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save bank account</button>}>
        <form className="space-y-4" onSubmit={handleBankSubmit}>
          <FormField label="Bank name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Account code"><input value={form.accountCode} onChange={(event) => setForm((current) => ({ ...current, accountCode: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Opening balance"><input type="number" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>
    </div>
  );
}

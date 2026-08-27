import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgePercent,
  Blocks,
  CalendarDays,
  CreditCard,
  FileCog,
  Sheet,
  Files,
  FileText,
  Folder,
  GitBranch,
  HandCoins,
  Landmark,
  Layers3,
  Receipt,
  RotateCcw,
  Shield,
  Users,
  Wallet,
  Globe,
} from 'lucide-react';

const setupCards = [
  { title: 'Fee Head', description: 'Fee Head Section', icon: Receipt, route: '/settings/fee-structure/fee-head' },
  { title: 'Fee Head Group', description: 'Fee Head Group Section', icon: FileCog, route: '/settings/fee-structure/fee-head-group' },
  { title: 'Fee Category', description: 'Fee Category Section', icon: Folder, route: '/settings/fee-structure/fee-category' },
  { title: 'Admission Category', description: 'Admission Category Master', icon: Users, route: '/settings/fee-structure/admission-category' },
  { title: 'Installments', description: 'Installments Section', icon: HandCoins, route: '/settings/fee-structure/installments' },
  { title: 'Term Groups', description: 'Setting Term Group', icon: CalendarDays, route: '/settings/fee-structure/term-groups' },
  { title: 'Fee Group', description: 'Fee Group Section', icon: Layers3, route: '/settings/fee-structure/fee-group' },
  { title: 'Concession', description: 'Concession Section', icon: BadgePercent, route: '/settings/fee-structure/concession' },
  { title: 'Receipt Setting', description: 'Receipt Setting', icon: Receipt, route: '/settings/fee-structure/receipt-setting' },
  { title: 'Fine Config', description: 'Fine Config Setting', icon: FileCog, route: '/settings/fee-structure/fine-config' },
  { title: 'Miscellaneous Remark', description: 'Miscellaneous Remark Setting', icon: FileText, route: '/settings/fee-structure/miscellaneous-remark' },
  { title: 'Receipt Remark', description: 'Receipt Remark Setting', icon: FileText, route: '/settings/fee-structure/receipt-remark' },
  { title: 'Other Income Head', description: 'Other Income Head Setting', icon: Wallet, route: '/settings/fee-structure/other-income-head' },
  { title: 'Institute Bank', description: 'Institute Bank Master', icon: Landmark, route: '/settings/fee-structure/institute-bank' },
  { title: 'Subject Combination', description: 'Subject Combination', icon: Blocks, route: '/settings/fee-structure/subject-combination' },
  { title: 'Payment Mode', description: 'Payment Mode Setup', icon: CreditCard, route: '/settings/fee-structure/payment-mode' },
  { title: 'Liability Heads', description: 'Liability Heads Setup', icon: Shield, route: '/settings/fee-structure/liability-heads' },
  { title: 'Refundable Heads', description: 'Refundable Heads Setup', icon: RotateCcw, route: '/settings/fee-structure/refundable-heads' },
  { title: 'Fee Excel Upload', description: 'Fee Excel Upload Setup', icon: Sheet, route: '/settings/fee-structure/fee-excel-upload' },
  { title: 'Other Income Account Mapper', description: 'Other Income Account Mapper Setup', icon: GitBranch, route: '/settings/fee-structure/other-income-account-mapper' },
  { title: 'Manage Online Fee', description: 'Manage Online Fee', icon: Globe, route: '/settings/fee-structure/manage-online-fee' },
  { title: 'Tuition Fee Certificate Grouping', description: 'Tuition Fee Certificate Grouping', icon: Files, route: '/settings/fee-structure/tuition-fee-certificate-grouping' },
];

export default function InstituteSetupPage2() {
  const navigate = useNavigate();
  const cards = useMemo(() => setupCards, []);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Advanced fee configuration modules</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-[15px]">
              Continue your institute setup with fee and finance settings designed for clean administration.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            22 fee setup modules available
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                type="button"
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.03 }}
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={() => navigate(card.route)}
                className="group hover-gradient-border flex min-h-[190px] w-full flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors duration-200 group-hover:text-sky-700">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-[190px] text-sm leading-5 text-slate-500">
                  {card.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/settings/fee-structure')}
            className="inline-flex h-[42px] w-[95px] items-center justify-center rounded-[999px] bg-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

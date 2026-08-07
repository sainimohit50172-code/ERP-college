import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Banknote,
  BanknoteCheck,
  ClipboardList,
  Coins,
  CreditCard,
  DollarSign,
  FileStack,
  FileText,
  Grid3x3,
  HandCoins,
  Layers,
  ListChecks,
  Receipt,
  ReceiptText,
  Repeat,
  SquareStack,
  Tag,
  UserCheck,
  Wallet,
  WalletCards,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const MotionLink = motion.create(Link);

const feeStructureModules = [
  { title: 'Fee Head', subtitle: 'Fee Head Section', icon: ClipboardList, route: '/settings/fee-structure/fee-head' },
  { title: 'Fee Head Group', subtitle: 'Fee Head Group Section', icon: Grid3x3, route: '/settings/fee-structure/fee-head-group' },
  { title: 'Fee Category', subtitle: 'Fee Category Section', icon: Layers, route: '/settings/fee-structure/fee-category' },
  { title: 'Admission Category', subtitle: 'Admission Category Master', icon: UserCheck, route: '/settings/fee-structure/admission-category' },
  { title: 'Installments', subtitle: 'Installments Section', icon: Wallet, route: '/settings/fee-structure/installments' },
  { title: 'Term Groups', subtitle: 'Setting Term Group', icon: Repeat, route: '/settings/fee-structure/term-groups' },
  { title: 'Fee Group', subtitle: 'Fee Group Section', icon: WalletCards, route: '/settings/fee-structure/fee-group' },
  { title: 'Concession', subtitle: 'Concession Section', icon: DollarSign, route: '/settings/fee-structure/concession' },
  { title: 'Receipt Setting', subtitle: 'Receipt Setting', icon: Receipt, route: '/settings/fee-structure/receipt-setting' },
  { title: 'Fine Config', subtitle: 'Fine Config Setting', icon: ReceiptText, route: '/settings/fee-structure/fine-config' },
  { title: 'Miscellaneous Remark', subtitle: 'Miscellaneous Remark Setting', icon: Tag, route: '/settings/fee-structure/miscellaneous-remark' },
  { title: 'Receipt Remark', subtitle: 'Receipt Remark Setting', icon: ClipboardList, route: '/settings/fee-structure/receipt-remark' },
  { title: 'Other Income Head', subtitle: 'Other Income Head Setting', icon: HandCoins, route: '/settings/fee-structure/other-income-head' },
  { title: 'Institute Bank', subtitle: 'Institute Bank Master', icon: Banknote, route: '/settings/fee-structure/institute-bank' },
  { title: 'Subject Combination', subtitle: 'Subject Combination', icon: SquareStack, route: '/settings/fee-structure/subject-combination' },
  { title: 'Payment Mode', subtitle: 'Payment Mode Setup', icon: CreditCard, route: '/settings/fee-structure/payment-mode' },
  { title: 'Liability Heads', subtitle: 'Liability Heads Setup', icon: ListChecks, route: '/settings/fee-structure/liability-heads' },
  { title: 'Refundable Heads', subtitle: 'Refundable Heads Setup', icon: Receipt, route: '/settings/fee-structure/refundable-heads' },
  { title: 'Fee Excel Upload', subtitle: 'Fee Excel Upload Setup', icon: FileText, route: '/settings/fee-structure/fee-excel-upload' },
  { title: 'Other Income Account Mapper', subtitle: 'Other Income Account Mapper Setup', icon: FileStack, route: '/settings/fee-structure/other-income-account-mapper' },
  { title: 'Manage Online Fee', subtitle: 'Manage Online Fee', icon: CreditCard, route: '/settings/fee-structure/manage-online-fee' },
  { title: 'Tuition Fee Certificate Grouping', subtitle: 'Tuition Fee Certificate Grouping', icon: WalletCards, route: '/settings/fee-structure/tuition-fee-certificate-grouping' },
];

export default function FeeStructureDashboardPage() {
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Fee Structure' }]} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Dashboard</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Fee Structure</h1>
            <p className="max-w-2xl text-sm text-slate-500">Manage fee structure and payment settings across the ERP.</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {feeStructureModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <MotionLink
                key={module.title}
                to={module.route}
                aria-label={`${module.title}: ${module.subtitle}`}
                className="group flex h-full min-h-[220px] max-h-[240px] flex-col justify-between overflow-hidden rounded-[18px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.02] hover:border-emerald-500 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.04 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full bg-[#F5F8FC] p-3 text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={46} aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-8 flex flex-1 flex-col justify-center gap-3 text-left">
                  <h2 className="text-xl font-semibold text-slate-900 transition duration-300 group-hover:text-emerald-600">{module.title}</h2>
                  <p className="text-sm leading-6 text-slate-500 transition duration-300 group-hover:text-slate-700">{module.subtitle}</p>
                </div>
              </MotionLink>
            );
          })}
        </section>
      </div>
    </div>
  );
}

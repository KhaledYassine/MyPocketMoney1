'use client';

import React, { useState } from 'react';
import { AppProvider } from '@/lib/store';
import { Navigation } from '@/components/Navigation';
import { RecordsView } from '@/components/RecordsView';
import { AnalysisView } from '@/components/AnalysisView';
import { BudgetsView } from '@/components/BudgetsView';
import { TricountView } from '@/components/TricountView';
import { WishlistView } from '@/components/WishlistView';
import { AccountDetailModal } from '@/components/AccountDetailModal';
import { CategoryDetailModal } from '@/components/CategoryDetailModal';
import { TricountDetailModal } from '@/components/TricountDetailModal';
import { SettlementsNotificationModal } from '@/components/SettlementsNotificationModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState('records');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:pl-64">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Tab Content View */}
      <main className="flex-1">
        {activeTab === 'records' && <RecordsView />}
        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'tricount' && <TricountView />}
        {activeTab === 'wishlist' && <WishlistView />}
      </main>

      {/* Global Interactive Entity Inspection Modals */}
      <AccountDetailModal />
      <CategoryDetailModal />
      <TricountDetailModal />

      {/* Settlement Requests Notifications Modal */}
      <SettlementsNotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

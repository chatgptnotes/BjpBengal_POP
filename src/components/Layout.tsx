import React, { useState } from 'react'
import RealTimeIndicator from './RealTimeIndicator'
import LoginModal from './LoginModal'
import DualSidebarLayout from './navigation/DualSidebarLayout'
import VersionFooter from './VersionFooter'
import { CheckCircle as CheckIcon } from '@mui/icons-material'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <DualSidebarLayout>
      <main className="flex-1">
        <div className="py-8 sm:py-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="md:hidden mb-6">
              <RealTimeIndicator />
            </div>
            {/* Content wrapper with subtle background */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Version Footer - Auto-incremented */}
      <VersionFooter />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </DualSidebarLayout>
  )
}

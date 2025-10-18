'use client'
import React, { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
          🎯 BattlePlan Dashboard
        </h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'dashboard' ? '#3b82f6' : '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'calendar' ? '#3b82f6' : '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Calendar
          </button>
        </div>

        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px' }}>
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Dashboard Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#334155', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>42</div>
                  <div style={{ color: '#94a3b8' }}>Total Leads</div>
                </div>
                <div style={{ background: '#334155', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>18</div>
                  <div style={{ color: '#94a3b8' }}>Active Opportunities</div>
                </div>
                <div style={{ background: '#334155', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>32%</div>
                  <div style={{ color: '#94a3b8' }}>Conversion Rate</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Calendar</h2>
              <p style={{ color: '#94a3b8' }}>Calendar view coming soon...</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', padding: '20px', background: '#10b981', borderRadius: '8px' }}>
          <strong>✅ Deployment Successful!</strong> Your dashboard is live and working.
        </div>
      </div>
    </div>
  )
}

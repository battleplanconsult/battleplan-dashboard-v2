'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function MasterDashboard() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [sortBy, setSortBy] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalLeads: 0,
    totalRevenue: 0,
    avgConversionRate: 0,
    totalAICalls: 0,
    totalEmailsProcessed: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientsError) throw clientsError;

      // For each client, fetch their stats
      const clientsWithStats = await Promise.all(
        (clientsData || []).map(async (client) => {
          // Get communications count
          const { data: comms } = await supabase
            .from('communications')
            .select('id, type', { count: 'exact' })
            .eq('client_id', client.id);

          // Get opportunities
          const { data: opps } = await supabase
            .from('opportunities')
            .select('*')
            .eq('client_id', client.id);

          const totalLeads = comms?.length || 0;
          const activeOpportunities = opps?.filter(o => o.stage !== 'closed').length || 0;
          const activeMembers = opps?.filter(o => o.stage === 'active').length || 0;
          const conversionRate = totalLeads > 0 ? ((activeMembers / totalLeads) * 100).toFixed(1) : 0;
          const totalRevenue = opps?.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0) || 0;

          return {
            ...client,
            totalLeads,
            newLeadsThisWeek: Math.floor(totalLeads * 0.2), // Mock for now
            activeOpportunities,
            conversionRate: parseFloat(conversionRate),
            totalRevenue,
            aiCalls: comms?.filter(c => c.type === 'call').length || 0,
            emailsProcessed: comms?.filter(c => c.type === 'email').length || 0,
            activeMemberships: activeMembers,
          };
        })
      );

      setClients(clientsWithStats);

      // Calculate system stats
      const stats = {
        totalClients: clientsWithStats.length,
        activeClients: clientsWithStats.filter(c => c.status === 'active').length,
        totalLeads: clientsWithStats.reduce((sum, c) => sum + c.totalLeads, 0),
        totalRevenue: clientsWithStats.reduce((sum, c) => sum + c.totalRevenue, 0),
        avgConversionRate: clientsWithStats.length > 0
          ? (clientsWithStats.reduce((sum, c) => sum + c.conversionRate, 0) / clientsWithStats.length).toFixed(1)
          : 0,
        totalAICalls: clientsWithStats.reduce((sum, c) => sum + c.aiCalls, 0),
        totalEmailsProcessed: clientsWithStats.reduce((sum, c) => sum + c.emailsProcessed, 0),
      };

      setSystemStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = searchQuery === '' || 
        client.business_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'revenue': return b.totalRevenue - a.totalRevenue;
        case 'leads': return b.totalLeads - a.totalLeads;
        case 'conversion': return b.conversionRate - a.conversionRate;
        case 'name': return a.business_name.localeCompare(b.business_name);
        default: return 0;
      }
    });

    return filtered;
  }, [clients, searchQuery, filterStatus, sortBy]);

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg text-2xl ${color}`}>{icon}</div>
        {trend && (
          <span className="text-emerald-400 text-sm flex items-center">
            📈 {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );

  const ClientCard = ({ client }) => (
    <div 
      onClick={() => setSelectedClient(client)}
      className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-amber-500 rounded-lg flex items-center justify-center text-2xl">
            🏢
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{client.business_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                client.status === 'active' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'
              }`}>
                {client.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                client.subscription_tier === 'premium' ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-700 text-slate-300'
              }`}>
                {client.subscription_tier}
              </span>
            </div>
          </div>
        </div>
        <span className="text-slate-400">→</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-slate-400 text-xs mb-1">Total Leads</div>
          <div className="text-white font-semibold text-lg">{client.totalLeads}</div>
          <div className="text-emerald-400 text-xs">+{client.newLeadsThisWeek} this week</div>
        </div>
        <div>
          <div className="text-slate-400 text-xs mb-1">Active Opps</div>
          <div className="text-white font-semibold text-lg">{client.activeOpportunities}</div>
        </div>
        <div>
          <div className="text-slate-400 text-xs mb-1">Conversion</div>
          <div className="text-white font-semibold text-lg">{client.conversionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">📞</span>
          <span className="text-slate-300 text-sm">{client.aiCalls} calls</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">📧</span>
          <span className="text-slate-300 text-sm">{client.emailsProcessed} emails</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs">Total Value</div>
          <div className="text-white font-bold text-xl">${client.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs">Members</div>
          <div className="text-slate-300 text-sm">{client.activeMemberships}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading master dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg text-2xl">📊</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                BattlePlan Master Dashboard
              </h1>
              <p className="text-slate-400 text-sm">System Overview & Client Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-emerald-400">●</span>
              <span className="text-slate-300 text-sm">System Status: </span>
              <span className="text-emerald-400 text-sm font-semibold">Online</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-amber-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">SA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="🏢" label="Total Clients" value={systemStats.totalClients} trend={8.3} color="bg-blue-900/50" />
          <StatCard icon="👥" label="Total Leads" value={systemStats.totalLeads} trend={12.5} color="bg-amber-900/50" />
          <StatCard icon="💰" label="Total Revenue" value={`$${systemStats.totalRevenue.toLocaleString()}`} trend={15.2} color="bg-emerald-900/50" />
          <StatCard icon="📈" label="Avg Conversion" value={`${systemStats.avgConversionRate}%`} trend={3.7} color="bg-blue-900/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">AI Calls Processed</div>
                <div className="text-white font-bold text-2xl">{systemStats.totalAICalls}</div>
              </div>
              <span className="text-4xl">📞</span>
            </div>
            <div className="text-emerald-400 text-sm">Across all clients</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Emails Processed</div>
                <div className="text-white font-bold text-2xl">{systemStats.totalEmailsProcessed}</div>
              </div>
              <span className="text-4xl">📧</span>
            </div>
            <div className="text-emerald-400 text-sm">Across all clients</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Active Clients</div>
                <div className="text-white font-bold text-2xl">{systemStats.activeClients}</div>
              </div>
              <span className="text-4xl">✅</span>
            </div>
            <div className="text-emerald-400 text-sm">Currently subscribed</div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Client Accounts</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="trial">Trial Only</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="revenue">Sort by Revenue</option>
                <option value="leads">Sort by Leads</option>
                <option value="conversion">Sort by Conversion</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No clients found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.map(client => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>

        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedClient(null)}>
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-amber-500 rounded-lg flex items-center justify-center text-3xl">🏢</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClient.business_name}</h2>
                    <p className="text-slate-400">{selectedClient.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">Subscription</div>
                  <div className="text-white font-semibold text-lg capitalize">{selectedClient.subscription_tier}</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">Status</div>
                  <div className="text-white font-semibold text-lg capitalize">{selectedClient.status}</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-2">Members</div>
                  <div className="text-white font-semibold text-lg">{selectedClient.activeMemberships}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Leads</span>
                      <span className="text-white font-semibold">{selectedClient.totalLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Opportunities</span>
                      <span className="text-white font-semibold">{selectedClient.activeOpportunities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Conversion Rate</span>
                      <span className="text-blue-400 font-semibold">{selectedClient.conversionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4">Communication</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Calls</span>
                      <span className="text-white font-semibold">{selectedClient.aiCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emails Processed</span>
                      <span className="text-white font-semibold">{selectedClient.emailsProcessed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Value</span>
                      <span className="text-emerald-400 font-semibold">${selectedClient.totalRevenue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href={`/?client_id=${selectedClient.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center"
                >
                  View Client Dashboard
                </a>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium">
                  Manage Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

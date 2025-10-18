'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [communications, setCommunications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date(2025, 9, 17));
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch communications
      const { data: commsData, error: commsError } = await supabase
        .from('communications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (commsError) throw commsError;
      setCommunications(commsData || []);

      // Fetch opportunities
      const { data: oppsData, error: oppsError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (oppsError) throw oppsError;
      setOpportunities(oppsData || []);

      // Fetch calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (eventsError) throw eventsError;
      setCalendarEvents(eventsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const stats = {
    newLeads: communications.length,
    emailCount: communications.filter(c => c.type === 'email').length,
    callCount: communications.filter(c => c.type === 'call').length,
    activeOpps: opportunities.filter(o => o.stage !== 'closed').length,
    conversionRate: opportunities.length > 0 
      ? ((opportunities.filter(o => o.stage === 'active').length / opportunities.length) * 100).toFixed(1)
      : '0.0',
    pendingTasks: calendarEvents.length
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg text-2xl ${color}`}>{icon}</div>
        {trend && <span className="text-emerald-400 text-sm">📈 {trend}</span>}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );

  const CalendarMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-800/50 border border-slate-700/50" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === new Date(2025, 9, 17).toDateString();
      
      days.push(
        <div key={day} className={`min-h-[120px] bg-slate-800 border border-slate-700 p-2 hover:border-blue-500 transition-all ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{day}</div>
          <div className="space-y-1">
            {events.map(event => (
              <div key={event.id} onClick={() => setSelectedEvent(event)} className="text-xs p-1 rounded cursor-pointer truncate bg-blue-900/50 text-blue-300 hover:bg-blue-900">
                📅 {new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-px bg-slate-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-800 p-3 text-center text-sm font-semibold text-slate-300 border border-slate-700">{day}</div>
        ))}
        {days}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading data...</div>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard icon="👥" label="Total Communications" value={stats.newLeads} color="bg-blue-900/50" trend="+12%" />
              <StatCard icon="📧" label="Emails Received" value={stats.emailCount} color="bg-blue-900/50" trend="+8%" />
              <StatCard icon="📞" label="AI Calls Logged" value={stats.callCount} color="bg-emerald-900/50" trend="+15%" />
              <StatCard icon="📈" label="Active Opportunities" value={stats.activeOpps} color="bg-amber-900/50" />
              <StatCard icon="✅" label="Conversion Rate" value={`${stats.conversionRate}%`} color="bg-emerald-900/50" trend="+5%" />
              <StatCard icon="⏰" label="Upcoming Events" value={stats.pendingTasks} color="bg-amber-900/50" />
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Communications</h2>
              {communications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No communications yet</p>
                  <p className="text-slate-500 text-sm">Add your first lead to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communications.map(comm => (
                    <div key={comm.id} className="bg-slate-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{comm.type === 'email' ? '📧' : '📞'} {comm.sender_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${comm.status === 'new' ? 'bg-amber-900/50 text-amber-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                          {comm.status}
                        </span>
                      </div>
                      <p className="text-amber-400 text-sm mb-1">{comm.intent || 'General Inquiry'}</p>
                      <p className="text-slate-300 text-sm">{comm.summary || comm.message_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">📅 Calendar</h1>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">➕ New Event</button>
            </div>
            <CalendarMonthView />
            
            {selectedEvent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
                <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full border border-slate-700" onClick={e => e.stopPropagation()}>
                  <h2 className="text-xl font-bold text-white mb-4">Event Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm">Title</label>
                      <p className="text-white font-semibold">{selectedEvent.title}</p>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">Date & Time</label>
                      <p className="text-white">{new Date(selectedEvent.event_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">Description</label>
                      <p className="text-slate-300">{selectedEvent.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Close</button>
                </div>
              </div>
            )}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">💼 Opportunities</h1>
            {opportunities.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400 mb-4">No opportunities yet</p>
                <p className="text-slate-500 text-sm">Start adding leads to track opportunities!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all">
                    <h3 className="text-white font-semibold text-lg mb-2">👤 {opp.lead_name}</h3>
                    <p className="text-amber-400 text-sm mb-2">{opp.intent || 'General Inquiry'}</p>
                    <p className="text-slate-300 text-sm mb-3">{opp.notes}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">💰 ${opp.value || '0'}</span>
                      <span className={`px-3 py-1 rounded text-xs ${opp.stage === 'new' ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                        {opp.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg text-2xl">📊</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">BattlePlan</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-700 rounded-lg text-xl">🔔<span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" /></button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-amber-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'calendar', icon: '📅', label: 'Calendar' },
              { id: 'opportunities', icon: '💼', label: 'Opportunities' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6">{renderContent()}</div>
      </div>
    </div>
  );
}

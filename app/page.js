'use client'
import React, { useState, useMemo } from 'react';
import { BarChart3, Mail, Phone, Users, TrendingUp, Calendar, Bell, Search, Plus, ChevronRight, MessageSquare, CheckCircle2, Clock, ChevronLeft } from 'lucide-react';

const mockCommunications = [
  {
    id: 1,
    type: 'email',
    senderName: 'Sarah Thompson',
    senderEmail: 'sarah.thompson@email.com',
    phone: '555-0123',
    intent: 'Kids Program Inquiry',
    summary: 'Interested in trial class for child next week',
    messageText: "Hi, I'm interested in trying a class for my son. Do you have openings next week?",
    status: 'new',
    timestamp: new Date('2025-10-16T14:30:00'),
  },
  {
    id: 2,
    type: 'call',
    senderName: 'Mike Rodriguez',
    senderEmail: 'mike.r@email.com',
    phone: '555-0456',
    intent: 'Membership Inquiry',
    summary: 'Asked about adult BJJ classes and pricing',
    messageText: 'Called to inquire about Brazilian Jiu-Jitsu classes for beginners.',
    status: 'contacted',
    timestamp: new Date('2025-10-16T10:15:00'),
  },
];

const mockOpportunities = [
  {
    id: 1,
    leadName: 'Sarah Thompson',
    contactInfo: 'sarah.thompson@email.com | 555-0123',
    source: 'email',
    stage: 'new',
    intent: 'Kids Program Inquiry',
    notes: 'Interested in trial class for child',
    assignedTo: 'Staff Member',
    value: 150
  },
  {
    id: 2,
    leadName: 'Mike Rodriguez',
    contactInfo: 'mike.r@email.com | 555-0456',
    source: 'call',
    stage: 'trial',
    intent: 'Membership Inquiry',
    notes: 'Trial scheduled for Oct 18th',
    assignedTo: 'Staff Member',
    value: 200
  },
];

const mockCalendarEvents = [
  {
    id: 1,
    title: 'Sarah Thompson - Trial Class',
    type: 'booking',
    date: new Date('2025-10-18T10:00:00'),
    duration: 60,
    description: 'Kids program trial class'
  },
  {
    id: 2,
    title: 'Mike Rodriguez - Trial Session',
    type: 'booking',
    date: new Date('2025-10-18T14:00:00'),
    duration: 60,
    description: 'Adult BJJ trial'
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate] = useState(new Date(2025, 9, 17));
  const [selectedEvent, setSelectedEvent] = useState(null);

  const stats = {
    newLeads: 4,
    emailCount: 2,
    callCount: 2,
    activeOpps: 2,
    conversionRate: 25.0,
    pendingTasks: 3
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
    return mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-emerald-400 text-sm flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </span>
        )}
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
        <div 
          key={day} 
          className={`min-h-[120px] bg-slate-800 border border-slate-700 p-2 hover:border-blue-500 transition-all ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="text-xs p-1 rounded cursor-pointer truncate bg-blue-900/50 text-blue-300 hover:bg-blue-900"
              >
                {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-px bg-slate-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-800 p-3 text-center text-sm font-semibold text-slate-300 border border-slate-700">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard icon={Users} label="New Leads This Week" value={stats.newLeads} color="bg-blue-900/50" trend="+12%" />
              <StatCard icon={Mail} label="Emails Received" value={stats.emailCount} color="bg-blue-900/50" trend="+8%" />
              <StatCard icon={Phone} label="AI Calls Logged" value={stats.callCount} color="bg-emerald-900/50" trend="+15%" />
              <StatCard icon={TrendingUp} label="Active Opportunities" value={stats.activeOpps} color="bg-amber-900/50" />
              <StatCard icon={CheckCircle2} label="Conversion Rate" value={`${stats.conversionRate}%`} color="bg-emerald-900/50" trend="+5%" />
              <StatCard icon={Clock} label="Pending Follow-Ups" value={stats.pendingTasks} color="bg-amber-900/50" />
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Communications</h2>
              <div className="space-y-3">
                {mockCommunications.map(comm => (
                  <div key={comm.id} className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{comm.senderName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        comm.status === 'new' ? 'bg-amber-900/50 text-amber-300' : 'bg-emerald-900/50 text-emerald-300'
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                    <p className="text-amber-400 text-sm mb-1">{comm.intent}</p>
                    <p className="text-slate-300 text-sm">{comm.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Calendar</h1>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Event
              </button>
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
                      <p className="text-white">{new Date(selectedEvent.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">Description</label>
                      <p className="text-slate-300">{selectedEvent.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Opportunities</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockOpportunities.map(opp => (
                <div key={opp.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-white font-semibold text-lg mb-2">{opp.leadName}</h3>
                  <p className="text-amber-400 text-sm mb-2">{opp.intent}</p>
                  <p className="text-slate-300 text-sm mb-3">{opp.notes}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">${opp.value}</span>
                    <span className={`px-3 py-1 rounded text-xs ${
                      opp.stage === 'new' ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/50 text-emerald-300'
                    }`}>
                      {opp.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">BattlePlan</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-700 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
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
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' },
              { id: 'opportunities', icon: Users, label: 'Opportunities' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

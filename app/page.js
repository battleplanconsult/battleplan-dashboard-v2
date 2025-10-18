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

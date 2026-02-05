'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, isToday, isSameMonth, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate, getMonth, getYear } from 'date-fns';
import { 
  Lock, Unlock, Clock, AlertCircle, Check, X, 
  Calendar as CalendarIcon, Users, ChevronLeft, 
  ChevronRight, RefreshCw, Eye, EyeOff, CalendarDays
} from 'lucide-react';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBlockedByAdmin: boolean;
  blockedReason?: string;
  bookingsMade: number;
  maxBookings: number;
  service?: { name: string };
  isAvailable?: boolean;
  isBooked?: boolean;
  isBlocked?: boolean;
  date?: string;
}

export default function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [slotsByDay, setSlotsByDay] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [showWeekends, setShowWeekends] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    blockedSlots: 0,
  });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch slots for the current month - USING ADMIN API
  const fetchSlotsForMonth = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      console.log(`📅 Fetching ADMIN slots for ${year}-${month}`);
      
      // Use the new admin API that includes blocked slots
      const response = await fetch(`/api/availability/admin?year=${year}&month=${month}`);
      
      if (!response.ok) {
        // If admin API fails, try public API as fallback
        console.log('Admin API failed, trying public API...');
        const publicResponse = await fetch(`/api/availability/public?year=${year}&month=${month}`);
        if (!publicResponse.ok) {
          throw new Error('Failed to fetch availability data');
        }
        
        const data = await publicResponse.json();
        
        // Transform the API data
        const transformedSlots: Record<string, Slot[]> = {};
        
        if (data.groupedByDate) {
          Object.entries(data.groupedByDate).forEach(([date, slots]: [string, any]) => {
            transformedSlots[date] = slots.map((slot: any) => ({
              id: slot.id,
              startTime: slot.time,
              endTime: slot.endTime,
              isBlockedByAdmin: slot.blockedByAdmin || slot.isBlocked || false,
              blockedReason: slot.blockedReason,
              bookingsMade: slot.bookingsMade || 0,
              maxBookings: slot.maxBookings || 1,
              service: slot.serviceName ? { name: slot.serviceName } : undefined,
              isAvailable: slot.isAvailable,
              isBooked: slot.isBooked,
              isBlocked: slot.isBlocked,
              date: slot.date
            }));
          });
        }
        
        setSlotsByDay(transformedSlots);
        
        if (data.summary) {
          setStats({
            totalSlots: data.summary.totalSlots || 0,
            availableSlots: data.summary.available || 0,
            bookedSlots: data.summary.booked || 0,
            blockedSlots: data.summary.blocked || 0,
          });
        }
      } else {
        // Use admin API response
        const data = await response.json();
        
        // Transform the API data
        const transformedSlots: Record<string, Slot[]> = {};
        
        if (data.groupedByDate) {
          Object.entries(data.groupedByDate).forEach(([date, slots]: [string, any]) => {
            transformedSlots[date] = slots.map((slot: any) => ({
              id: slot.id,
              startTime: slot.time,
              endTime: slot.endTime,
              isBlockedByAdmin: slot.blockedByAdmin || slot.isBlocked || false,
              blockedReason: slot.blockedReason,
              bookingsMade: slot.bookingsMade || 0,
              maxBookings: slot.maxBookings || 1,
              service: slot.serviceName ? { name: slot.serviceName } : undefined,
              isAvailable: slot.isAvailable,
              isBooked: slot.isBooked,
              isBlocked: slot.isBlocked,
              date: slot.date
            }));
          });
        }
        
        console.log(`📊 Loaded ${Object.keys(transformedSlots).length} days with slots`);
        
        setSlotsByDay(transformedSlots);
        
        if (data.summary) {
          setStats({
            totalSlots: data.summary.totalSlots || 0,
            availableSlots: data.summary.available || 0,
            bookedSlots: data.summary.booked || 0,
            blockedSlots: data.summary.blocked || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      showNotification('error', 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchSlotsForMonth();
  }, [fetchSlotsForMonth]);

  // Handle single slot block/unblock
  const handleBlockSlot = async (slotId: string, block: boolean, reason: string = '') => {
    setIsProcessing(true);
    try {
      console.log(`🔄 ${block ? 'Blocking' : 'Unblocking'} slot ${slotId}`);
      
      const response = await fetch(`/api/availability/${slotId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          block, 
          reason: reason || (block ? 'Slot blocked by admin' : 'Slot unblocked by admin') 
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('success', result.message || `Time slot ${block ? 'blocked' : 'unblocked'} successfully`);
        // Refresh immediately
        await fetchSlotsForMonth();
      } else {
        showNotification('error', result.error || `Failed to ${block ? 'block' : 'unblock'} slot`);
      }
    } catch (error) {
      console.error('Error blocking slot:', error);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

  // Generate REAL calendar grid for the month
  const generateCalendarDays = () => {
    const year = getYear(currentDate);
    const month = getMonth(currentDate);
    
    // First day of the month
    const firstDayOfMonth = startOfMonth(currentDate);
    // Last day of the month
    const lastDayOfMonth = endOfMonth(currentDate);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = getDay(firstDayOfMonth); // 0-6
    
    // Create array for the calendar
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    
    // Add padding days from previous month (to start on Sunday)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    // Generate 42 days (6 weeks) for consistent calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        date,
        isCurrentMonth: isSameMonth(date, currentDate)
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const slotsForSelectedDay = slotsByDay[selectedDate] || [];

  // Helper function to format time
  const formatTime = (timeStr: string) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Get day of week name
  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };

  // Check if a day is a weekday (Monday-Friday)
  const isWeekday = (date: Date) => {
    const day = getDay(date);
    return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slotsByDay[dateStr] || [];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 p-4 rounded-xl shadow-xl z-50 animate-slide-in border ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : notification.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 text-green-600 mr-3" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
            )}
            <div>
              <p className="font-semibold">{notification.message}</p>
              <button 
                onClick={() => setNotification(null)} 
                className="text-sm text-gray-500 hover:text-gray-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Month Navigation */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="h-8 w-8 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>
            </div>
            <p className="text-gray-600">Click on any date to view and manage time slots</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
              <button
                onClick={prevMonth}
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center min-w-[180px]">
                <h2 className="text-lg font-bold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
              </div>
              
              <button
                onClick={nextMonth}
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={() => setShowWeekends(!showWeekends)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${
                showWeekends 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {showWeekends ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Weekends
            </button>
            
            <button
              onClick={fetchSlotsForMonth}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Slots</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalSlots}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">{format(currentDate, 'MMMM yyyy')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Available</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.availableSlots}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">Ready to book</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Booked</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.bookedSlots}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">Confirmed sessions</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Blocked</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.blockedSlots}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">Unavailable slots</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: REAL Calendar */}
        <div className="lg:col-span-2">
          {/* REAL Calendar Grid */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Day Headers - Starting with Sunday */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center py-3">
                  <div className="text-sm font-semibold text-gray-700">{day}</div>
                </div>
              ))}
            </div>

            {/* Calendar Days - 6 rows × 7 columns = 42 days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const date = day.date;
                const dateStr = format(date, 'yyyy-MM-dd');
                const isCurrentMonth = day.isCurrentMonth;
                const isCurrentDay = isToday(date);
                const daySlots = getSlotsForDate(date);
                const isSelected = selectedDate === dateStr;
                const isWeekend = getDay(date) === 0 || getDay(date) === 6;
                const isWeekday = getDay(date) >= 1 && getDay(date) <= 5;
                
                const dayBlockedCount = daySlots.filter(s => s.isBlockedByAdmin).length;
                const dayAvailableCount = daySlots.filter(s => !s.isBlockedByAdmin && s.bookingsMade < s.maxBookings).length;
                const dayBookedCount = daySlots.filter(s => s.bookingsMade > 0).length;
                const hasSlots = daySlots.length > 0;

                // Determine background color based on day type
                let bgColor = 'bg-white';
                if (!isCurrentMonth) {
                  bgColor = 'bg-gray-50/30';
                } else if (isSelected) {
                  bgColor = 'bg-blue-50';
                } else if (isCurrentDay) {
                  bgColor = 'bg-blue-50/50';
                } else if (isWeekend && !showWeekends) {
                  bgColor = 'bg-gray-100';
                } else if (isWeekend) {
                  bgColor = 'bg-gray-50';
                }

                // If all slots are blocked for this day
                if (dayBlockedCount === daySlots.length && hasSlots) {
                  bgColor = 'bg-red-50';
                }

                // If it's a weekend and we're not showing weekends, or it's not current month
                if ((isWeekend && !showWeekends) || !isCurrentMonth) {
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-3 border-r border-b border-gray-100 ${bgColor} ${
                        !isCurrentMonth ? 'opacity-40' : ''
                      }`}
                    >
                      <div className={`font-medium text-sm ${
                        !isCurrentMonth ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {getDate(date)}
                      </div>
                      {isWeekend && !isCurrentMonth && (
                        <div className="mt-2 text-xs text-gray-400">Weekend</div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-3 border-r border-b border-gray-200 cursor-pointer transition-all ${bgColor} ${
                      hasSlots ? 'hover:bg-gray-50' : ''
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-2">
                      <div className={`
                        font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}
                        ${isCurrentDay && !isSelected ? 'text-blue-600' : ''}
                        ${isWeekend ? 'text-gray-600' : ''}
                      `}>
                        {getDate(date)}
                        {isCurrentDay && (
                          <span className="ml-1 text-xs text-blue-500">Today</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Slot Indicators - Only for weekdays */}
                    {isWeekday && isCurrentMonth ? (
                      hasSlots ? (
                        <div className="space-y-1 mt-2">
                          {dayAvailableCount > 0 && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-600">{dayAvailableCount} avail</span>
                            </div>
                          )}
                          
                          {dayBookedCount > 0 && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-600">{dayBookedCount} booked</span>
                            </div>
                          )}
                          
                          {dayBlockedCount > 0 && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-600">{dayBlockedCount} blocked</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center pt-2">
                          <span className="text-xs text-gray-400">No slots</span>
                        </div>
                      )
                    ) : isWeekend && isCurrentMonth ? (
                      <div className="h-full flex items-center justify-center pt-2">
                        <span className="text-xs text-gray-400 italic">Weekend</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Calendar Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Available slots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Booked slots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Blocked slots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-xs text-gray-600">No slots / Weekend</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Time Slots */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Selected Day Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Selected Day</h2>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </h3>
              
              {slotsForSelectedDay.length > 0 ? (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Slots:</span>
                    <span className="font-medium">{slotsForSelectedDay.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">
                      {slotsForSelectedDay.filter(s => !s.isBlockedByAdmin && s.bookingsMade < s.maxBookings).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Booked:</span>
                    <span className="font-medium text-blue-600">
                      {slotsForSelectedDay.filter(s => s.bookingsMade > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Blocked:</span>
                    <span className="font-medium text-red-600">
                      {slotsForSelectedDay.filter(s => s.isBlockedByAdmin).length}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No slots available for this day</p>
              )}
            </div>

            {/* Time Slots List */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Time Slots</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{slotsForSelectedDay.length} slots</span>
                  {slotsForSelectedDay.some(s => s.isBlockedByAdmin) && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      {slotsForSelectedDay.filter(s => s.isBlockedByAdmin).length} blocked
                    </span>
                  )}
                </div>
              </div>
              
              {slotsForSelectedDay.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No time slots</p>
                  <p className="text-gray-400 text-sm mt-2">Select a weekday to see available slots</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {slotsForSelectedDay.map((slot) => {
                    const isBlocked = slot.isBlockedByAdmin;
                    const isFullyBooked = slot.bookingsMade >= slot.maxBookings;
                    
                    return (
                      <div
                        key={slot.id}
                        className={`
                          p-4 rounded-lg border transition-all
                          ${isBlocked
                            ? 'border-red-200 bg-red-50'
                            : isFullyBooked
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-green-200 bg-green-50'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Clock className={`h-4 w-4 mr-2 ${isBlocked ? 'text-red-500' : isFullyBooked ? 'text-blue-500' : 'text-green-500'}`} />
                            <span className="font-medium text-gray-900">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          
                          {isBlocked ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              BLOCKED
                            </span>
                          ) : isFullyBooked ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              BOOKED
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              AVAILABLE
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {slot.bookingsMade}/{slot.maxBookings} booked
                          </div>
                          {slot.service?.name && (
                            <span className="text-xs text-gray-500">{slot.service.name}</span>
                          )}
                        </div>
                        
                        {isBlocked && slot.blockedReason && (
                          <div className="text-xs text-red-600 bg-red-100 p-2 rounded mb-2">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {slot.blockedReason}
                          </div>
                        )}
                        
                        {/* Individual Slot Block/Unblock Button */}
                        <div className="flex gap-2 mt-2">
                          {isBlocked ? (
                            <button
                              onClick={() => handleBlockSlot(slot.id, false)}
                              disabled={isProcessing}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 bg-green-50 border border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400"
                            >
                              <Unlock className="h-4 w-4" />
                              Unblock Slot
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockSlot(slot.id, true)}
                              disabled={isProcessing || isFullyBooked}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 bg-red-50 border border-red-300 text-red-800 hover:bg-red-100 hover:border-red-400"
                            >
                              <Lock className="h-4 w-4" />
                              Block Slot
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
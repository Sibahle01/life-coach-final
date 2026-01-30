'use client';

import { useState, useEffect } from 'react';
import { format, addDays, eachDayOfInterval, isToday, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { Lock, Unlock, Clock, AlertCircle, Check, X, Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBlockedByAdmin: boolean;
  blockedReason?: string;
  bookingsMade: number;
  maxBookings: number;
  service?: { name: string };
}

interface AvailabilityCalendarProps {
  slotsByDay: Record<string, Slot[]>;
}

export default function AvailabilityCalendar({ slotsByDay }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'block' | 'unblock'>('block');
  const [blockReason, setBlockReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

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

  // Calculate stats when slotsByDay changes
  useEffect(() => {
    let total = 0;
    let available = 0;
    let booked = 0;
    let blocked = 0;

    Object.values(slotsByDay).forEach(slots => {
      slots.forEach(slot => {
        total++;
        if (slot.isBlockedByAdmin) {
          blocked++;
        } else if (slot.bookingsMade > 0) {
          booked++;
        } else {
          available++;
        }
      });
    });

    setStats({ totalSlots: total, availableSlots: available, bookedSlots: booked, blockedSlots: blocked });
  }, [slotsByDay]);

  // Handle single slot block/unblock
  const handleBlockSlot = async (slotId: string, block: boolean, reason: string = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/availability/${slotId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block, reason })
      });
      
      if (response.ok) {
        showNotification('success', `Time slot ${block ? 'blocked' : 'unblocked'} successfully`);
        // Refresh after 1 second
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const error = await response.json();
        showNotification('error', `Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error blocking slot:', error);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk action for a day
  const handleBulkAction = async (action: 'block' | 'unblock', reason: string = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/availability/bulk-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: selectedDate, 
          reason: reason || `${action === 'block' ? 'Day blocked' : 'Day unblocked'} by admin`,
          action
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('success', result.message);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification('error', result.message || `Failed to ${action} day`);
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setShowBulkModal(false);
    }
  };

  const openBulkModal = (action: 'block' | 'unblock') => {
    const slotsForDay = slotsByDay[selectedDate] || [];
    const blockedCount = slotsForDay.filter(s => s.isBlockedByAdmin).length;
    
    if (action === 'block' && blockedCount === slotsForDay.length && slotsForDay.length > 0) {
      showNotification('info', 'All slots for this day are already blocked');
      return;
    }
    
    if (action === 'unblock' && blockedCount === 0) {
      showNotification('info', 'No blocked slots to unblock for this day');
      return;
    }
    
    setBulkAction(action);
    setBlockReason('');
    setShowBulkModal(true);
  };

  // Navigation
  const prevPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

  // Generate dates based on view mode
  let days: Date[] = [];
  if (viewMode === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    days = eachDayOfInterval({
      start,
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });
  } else {
    // Month view - generate 6 weeks (42 days) for consistent grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get starting day (Monday of the week containing 1st of month)
    const startDay = startOfWeek(firstDay, { weekStartsOn: 1 });
    
    // Get ending day (Sunday of the week containing last day of month)
    const endDay = endOfWeek(lastDay, { weekStartsOn: 1 });
    
    days = eachDayOfInterval({
      start: startDay,
      end: endDay
    });
  }

  const slotsForSelectedDay = slotsByDay[selectedDate] || [];
  const dayBlockedCount = slotsForSelectedDay.filter(s => s.isBlockedByAdmin).length;
  const dayAvailableCount = slotsForSelectedDay.filter(s => !s.isBlockedByAdmin && s.bookingsMade < s.maxBookings).length;
  const dayBookedCount = slotsForSelectedDay.filter(s => s.bookingsMade > 0).length;

  return (
    <div className="p-6">
      {/* Header - Similar to book orders */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Calendar</h1>
          <p className="text-gray-600 mt-2">Manage your coaching schedule and block unavailable times</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Calendar
        </button>
      </div>

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

      {/* Stats Cards - Similar spacing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Slots</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSlots}</p>
          <p className="text-xs text-gray-500 mt-1">Next 14 days</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.availableSlots}</p>
          <p className="text-xs text-gray-500 mt-1">Ready to book</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Booked</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.bookedSlots}</p>
          <p className="text-xs text-gray-500 mt-1">Confirmed sessions</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Blocked</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.blockedSlots}</p>
          <p className="text-xs text-gray-500 mt-1">Unavailable slots</p>
        </div>
      </div>

      {/* View Toggle and Navigation */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'month' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month View
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevPeriod}
              disabled={isLoading}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center min-w-[200px]">
              <h2 className="text-lg font-bold text-gray-900">
                {viewMode === 'week' 
                  ? `${format(days[0], 'MMM d')} - ${format(days[6], 'MMM d, yyyy')}`
                  : format(currentDate, 'MMMM yyyy')
                }
              </h2>
            </div>
            
            <button
              onClick={nextPeriod}
              disabled={isLoading}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center py-4">
              <div className="text-sm font-semibold text-gray-700">{day}</div>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true;
            const isCurrentDay = isToday(day);
            const daySlots = slotsByDay[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const dayBlockedCount = daySlots.filter(s => s.isBlockedByAdmin).length;
            
            if (!isCurrentMonth && viewMode === 'month') {
              return (
                <div
                  key={dateStr}
                  className="min-h-[120px] p-4 border-r border-b border-gray-100 bg-gray-50/50 opacity-40"
                >
                  <div className="text-gray-400 font-medium">{format(day, 'd')}</div>
                </div>
              );
            }
            
            return (
              <div
                key={dateStr}
                className={`
                  min-h-[120px] p-4 border-r border-b border-gray-200 cursor-pointer
                  ${isSelected 
                    ? 'bg-blue-50 border-blue-300' 
                    : isCurrentDay
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                  }
                  ${dayBlockedCount === daySlots.length && daySlots.length > 0 ? 'bg-red-50' : ''}
                `}
                onClick={() => setSelectedDate(dateStr)}
              >
                {/* Date Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className={`
                    font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}
                    ${isCurrentDay && !isSelected ? 'text-blue-600' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Quick Action Indicators */}
                  {daySlots.length > 0 && (
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBulkModal('block');
                        }}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Block all slots"
                      >
                        <Lock className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBulkModal('unblock');
                        }}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Unblock all slots"
                      >
                        <Unlock className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Slot Summary */}
                {daySlots.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">
                          {daySlots.filter(s => !s.isBlockedByAdmin && s.bookingsMade < s.maxBookings).length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">
                          {daySlots.filter(s => s.bookingsMade > 0).length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">
                          {dayBlockedCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">No slots</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details - Clean layout like book orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{dayAvailableCount} available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{dayBookedCount} booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{dayBlockedCount} blocked</span>
              </div>
            </div>
          </div>
          
          {/* Bulk Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => openBulkModal('block')}
              disabled={isLoading || slotsForSelectedDay.length === 0 || dayBlockedCount === slotsForSelectedDay.length}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Block All
            </button>
            <button
              onClick={() => openBulkModal('unblock')}
              disabled={isLoading || dayBlockedCount === 0}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Unlock className="h-4 w-4" />
              Unblock All
            </button>
          </div>
        </div>
        
        {/* Time Slots - Clean 2x2 grid */}
        {slotsForSelectedDay.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No availability slots for this day</p>
            <p className="text-gray-400 text-sm mt-2">Select another date or check your availability settings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slotsForSelectedDay.map((slot) => {
              const isBlocked = slot.isBlockedByAdmin;
              const isFullyBooked = slot.bookingsMade >= slot.maxBookings;
              
              return (
                <div
                  key={slot.id}
                  className={`
                    p-6 rounded-xl border transition-all
                    ${isBlocked
                      ? 'border-red-300 bg-red-50'
                      : isFullyBooked
                      ? 'border-gray-300 bg-gray-100'
                      : 'border-green-200 bg-white hover:border-green-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    {/* Slot Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Clock className={`h-5 w-5 mr-3 ${isBlocked ? 'text-red-500' : 'text-gray-700'}`} />
                          <span className="text-xl font-bold text-gray-900">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.service && (
                          <div className="text-sm text-gray-600 ml-8">
                            {slot.service.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-col items-end space-y-2">
                        {isBlocked && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            BLOCKED
                          </span>
                        )}
                        {isFullyBooked && !isBlocked && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            FULLY BOOKED
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Slot Details */}
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-lg font-medium text-gray-900">
                            {slot.bookingsMade}/{slot.maxBookings} booked
                          </div>
                          {slot.bookingsMade === slot.maxBookings && !isBlocked && (
                            <div className="text-sm text-blue-600 mt-1">No more slots available</div>
                          )}
                        </div>
                      </div>
                      
                      {isBlocked && slot.blockedReason && (
                        <div className="flex items-start p-3 bg-red-100 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-700">{slot.blockedReason}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-6">
                      {!isBlocked ? (
                        <button
                          onClick={() => handleBlockSlot(slot.id, true)}
                          disabled={isLoading}
                          className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          Block This Time Slot
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockSlot(slot.id, false)}
                          disabled={isLoading}
                          className="w-full px-4 py-3 bg-white border border-green-300 text-green-800 font-medium rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Unlock className="h-4 w-4" />
                          Unblock This Time Slot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {bulkAction === 'block' ? 'Block Entire Day' : 'Unblock Entire Day'}
                </h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  This will {bulkAction} all <span className="font-bold">{slotsForSelectedDay.length}</span> time slots for this day.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Reason (optional)
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                >
                  <option value="">Select a reason</option>
                  {bulkAction === 'block' ? (
                    <>
                      <option value="Vacation">Vacation Day</option>
                      <option value="Personal Day">Personal Day</option>
                      <option value="Holiday">Public Holiday</option>
                      <option value="Training">Training / Conference</option>
                      <option value="Other">Other Reason</option>
                    </>
                  ) : (
                    <>
                      <option value="Available Again">Available Again</option>
                      <option value="Schedule Change">Schedule Change</option>
                      <option value="Other">Other Reason</option>
                    </>
                  )}
                </select>
                
                {blockReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify the reason..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 mt-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBulkModal(false)}
                  disabled={isLoading}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkAction(bulkAction, blockReason)}
                  disabled={isLoading}
                  className={`px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    bulkAction === 'block' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {bulkAction === 'block' ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                      Confirm {bulkAction === 'block' ? 'Block' : 'Unblock'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
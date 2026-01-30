import { prisma } from '@/lib/prisma';
import AvailabilityCalendar from './AvailabilityCalendar';
import { Calendar, Lock, Users, Clock } from 'lucide-react';

export default async function AvailabilityPage() {
  // Fetch availability slots for the next 2 weeks
  const today = new Date();
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);

  const availabilitySlots = await prisma.availabilitySlot.findMany({
    where: {
      OR: [
        { specificDate: { gte: today, lte: twoWeeksLater } },
        { dayOfWeek: { not: null } }
      ]
    },
    include: {
      service: true,
      blockedByAdmin: true
    },
    orderBy: [
      { specificDate: 'asc' },
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  // Calculate statistics
  const totalSlots = availabilitySlots.length;
  const blockedSlots = availabilitySlots.filter(s => s.isBlockedByAdmin).length;
  const bookedSlots = availabilitySlots.filter(s => s.bookingsMade > 0).length;
  const availableSlots = totalSlots - blockedSlots - bookedSlots;

  // Group by day for the calendar
  const slotsByDay: Record<string, any[]> = {};
  
  availabilitySlots.forEach(slot => {
    let dateKey: string;
    
    if (slot.specificDate) {
      dateKey = slot.specificDate.toISOString().split('T')[0];
    } else if (slot.dayOfWeek !== null) {
      const dayIndex = slot.dayOfWeek || 0;
      const todayDay = today.getDay();
      let daysToAdd = dayIndex - todayDay;
      if (daysToAdd < 0) daysToAdd += 7;
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysToAdd);
      dateKey = nextDate.toISOString().split('T')[0];
    } else {
      return;
    }
    
    if (!slotsByDay[dateKey]) {
      slotsByDay[dateKey] = [];
    }
    slotsByDay[dateKey].push(slot);
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600 mt-2">Manage your coaching schedule and block unavailable times</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{totalSlots}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Next 14 days
            </div>
          </div>
          
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">{availableSlots}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Ready to book
            </div>
          </div>
          
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-purple-600">{bookedSlots}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Confirmed
            </div>
          </div>
          
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-red-600">{blockedSlots}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Unavailable
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 sm:p-6">
              <AvailabilityCalendar slotsByDay={slotsByDay} />
            </div>
          </div>
        </div>

        {/* Sidebar - Simple Info Only (No Buttons) */}
        <div className="space-y-6">
          {/* Simple Summary */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">At a Glance</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-medium">{availableSlots}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Booked</span>
                  <span className="font-medium">{bookedSlots}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Blocked</span>
                  <span className="font-medium">{blockedSlots}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${totalSlots > 0 ? (blockedSlots / totalSlots) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Quick Tips</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-2 mt-0.5">1</span>
                Click dates to view slots for that day
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-2 mt-0.5">2</span>
                Block slots when you're unavailable
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-2 mt-0.5">3</span>
                Booked slots are shown in blue
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
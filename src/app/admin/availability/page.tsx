import AvailabilityCalendar from './AvailabilityCalendar';

export default async function AvailabilityPage() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Clean Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Availability Management</h1>
        <p className="text-gray-600 mt-2">Manage your coaching schedule and block unavailable times</p>
      </div>

      {/* Full-width Calendar */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 sm:p-6">
          <AvailabilityCalendar />
        </div>
      </div>
    </div>
  );
}
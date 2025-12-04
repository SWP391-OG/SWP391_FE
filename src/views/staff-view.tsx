import { useState, useMemo } from 'react';
import type { User, Ticket } from '../types';
import ITStaffPage from '../pages/it-staff-page';
import FacilityStaffPage from '../pages/facility-staff-page';
import TicketDetailModal from '../components/ticket-detail-modal';
import { loadTickets, saveTickets } from '../utils/localStorage';

interface StaffViewProps {
  currentUser: User;
}

type StaffType = 'it' | 'facility';

const StaffView = ({ currentUser }: StaffViewProps) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [staffType, setStaffType] = useState<StaffType>(
    currentUser.role === 'it-staff' ? 'it' : 'facility'
  );
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  // Filter tickets assigned to current staff
  const staffTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.assignedTo === currentUser.id);
  }, [tickets, currentUser.id]);

  // Handle update ticket status
  const handleUpdateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
  };

  return (
    <>
      {/* Staff Type Selector */}
      <div className="bg-white border-b border-gray-200 py-4 px-8">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Loại Staff:</span>
          <div className="relative">
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all flex items-center gap-2 border-orange-500 bg-orange-50 text-orange-600"
              onClick={() => setShowStaffDropdown(!showStaffDropdown)}
            >
              {staffType === 'it' ? '💻 IT Staff' : '🔧 Facility Staff'}
              <span className={`transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showStaffDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                <button
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 ${
                    staffType === 'it' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setStaffType('it');
                    setShowStaffDropdown(false);
                  }}
                >
                  <span className="text-lg">💻</span>
                  IT Staff
                </button>
                <button
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 ${
                    staffType === 'facility' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setStaffType('facility');
                    setShowStaffDropdown(false);
                  }}
                >
                  <span className="text-lg">🔧</span>
                  Facility Staff
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Page Content */}
      {staffType === 'it' ? (
        <ITStaffPage
          tickets={staffTickets}
          onUpdateStatus={handleUpdateTicketStatus}
          onViewDetail={(ticket) => setSelectedTicket(ticket)}
        />
      ) : (
        <FacilityStaffPage
          tickets={staffTickets}
          onUpdateStatus={handleUpdateTicketStatus}
          onViewDetail={(ticket) => setSelectedTicket(ticket)}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
};

export default StaffView;
import { useState, useMemo } from 'react';
import type { User, IssueType, Ticket } from '../types';
import IssueSelectionPage from '../pages/issue-selection-page';
import CreateTicketPage from '../pages/create-ticket-page';
import TicketListPage from '../pages/ticket-list-page';
import TicketDetailModal from '../components/ticket-detail-modal';
import { loadTickets } from '../utils/localStorage';

interface StudentViewProps {
  currentUser: User | null;
}

type StudentViewType = 'home' | 'issue-selection' | 'create-ticket' | 'ticket-list';

const StudentView = ({ currentUser }: StudentViewProps) => {
  const [tickets] = useState<Ticket[]>(() => loadTickets());
  const [studentView, setStudentView] = useState<StudentViewType>('home');
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeStudentTab, setActiveStudentTab] = useState<'processing' | 'completed'>('processing');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Filter tickets by current user
  const studentTickets = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter(t => t.createdBy === currentUser.id);
  }, [tickets, currentUser]);

  const processingTickets = useMemo(() => {
    return studentTickets.filter(t => 
      ['open', 'acknowledged', 'in-progress'].includes(t.status) &&
      (studentSearchQuery === '' || 
       t.title.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
       t.description.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );
  }, [studentTickets, studentSearchQuery]);

  const completedTickets = useMemo(() => {
    return studentTickets.filter(t => 
      ['resolved', 'closed'].includes(t.status) &&
      (studentSearchQuery === '' || 
       t.title.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
       t.description.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );
  }, [studentTickets, studentSearchQuery]);

  const displayTickets = activeStudentTab === 'processing' ? processingTickets : completedTickets;

  const statusColors = {
    open: { bg: 'bg-blue-100', text: 'text-blue-800' },
    acknowledged: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  } as const;

  const statusLabels = {
    open: 'Mới tạo',
    acknowledged: 'Đã giao việc',
    'in-progress': 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
  } as const;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày trước`;
    }
  };

  const handleSubmitTicket = (ticket: Ticket) => {
    console.log('Ticket submitted:', ticket);
    alert('Ticket đã được gửi thành công! 🎉');
    setStudentView('home');
    setSelectedIssue(null);
  };

  // Render home view
  if (studentView === 'home') {
    return (
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">My requests</h1>
          <p className="text-lg text-gray-600">
            Xin chào, {currentUser?.fullName || 'Sinh viên'}!
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm ticket..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full py-3 px-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-200 box-border focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            className="py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.3)] hover:translate-y-[-1px] hover:shadow-[0_4px_8px_rgba(59,130,246,0.4)] whitespace-nowrap"
            onClick={() => setStudentView('issue-selection')}
          >
            + Tạo ticket mới
          </button>
        </div>

        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          <button
            className={`py-3 px-6 text-base font-semibold transition-all duration-200 border-none bg-transparent cursor-pointer ${
              activeStudentTab === 'processing'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveStudentTab('processing')}
          >
            Đang xử lí ({processingTickets.length})
          </button>
          <button
            className={`py-3 px-6 text-base font-semibold transition-all duration-200 border-none bg-transparent cursor-pointer ${
              activeStudentTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveStudentTab('completed')}
          >
            Đã hoàn thành ({completedTickets.length})
          </button>
        </div>

        {displayTickets.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {activeStudentTab === 'processing' ? 'Chưa có ticket đang xử lí' : 'Chưa có ticket hoàn thành'}
            </h3>
            <p className="text-base text-gray-500 mb-6">
              {activeStudentTab === 'processing' 
                ? 'Bạn chưa có ticket nào đang được xử lý'
                : 'Bạn chưa có ticket nào hoàn thành'}
            </p>
            {activeStudentTab === 'processing' && (
              <button
                className="py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,0.3)] hover:translate-y-[-1px] hover:shadow-[0_4px_8px_rgba(59,130,246,0.4)]"
                onClick={() => setStudentView('issue-selection')}
              >
                Tạo ticket mới
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl p-5 border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold ${statusColors[ticket.status as keyof typeof statusColors]?.bg} ${statusColors[ticket.status as keyof typeof statusColors]?.text}`}>
                    {statusLabels[ticket.status as keyof typeof statusLabels] || ticket.status}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{ticket.title}</h3>
                
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
                
                <div className="flex flex-col gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>{ticket.issueType.icon}</span>
                    <span>{ticket.issueType.name}</span>
                  </div>
                  {ticket.location && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{ticket.location} {ticket.roomNumber && `- ${ticket.roomNumber}`}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    );
  }

  // Render issue selection
  if (studentView === 'issue-selection') {
    return (
      <IssueSelectionPage
        onSelectIssue={(issueType) => {
          setSelectedIssue(issueType);
          setStudentView('create-ticket');
        }}
        onBack={() => setStudentView('home')}
      />
    );
  }

  // Render create ticket
  if (studentView === 'create-ticket' && selectedIssue) {
    return (
      <CreateTicketPage
        issueType={selectedIssue}
        onBack={() => setStudentView('issue-selection')}
        onSubmit={handleSubmitTicket}
      />
    );
  }

  // Render ticket list
  if (studentView === 'ticket-list') {
    return (
      <TicketListPage
        onViewDetail={(ticket) => setSelectedTicket(ticket)}
        onBack={() => setStudentView('home')}
      />
    );
  }

  return null;
};

export default StudentView;
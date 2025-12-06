import { issueTypes } from '../../data/issueTypes';
import type { IssueType } from '../../types';

interface IssueSelectionPageProps {
  onSelectIssue: (issueType: IssueType) => void;
  onBack?: () => void;
}

const IssueSelectionPage = ({ onSelectIssue, onBack }: IssueSelectionPageProps) => {
  // Filter to only show 3 issue types for students
  const allowedIssueTypeIds = ['facility-broken', 'wifi-issue', 'equipment-broken'];
  const filteredIssueTypes = issueTypes.filter(issueType => 
    allowedIssueTypeIds.includes(issueType.id)
  );
  
  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="mb-8 text-center">
        {onBack && (
          <div className="text-left">
            <button 
              className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium mb-6 transition-all duration-200 hover:bg-gray-300"
              onClick={onBack}
            >
              ← Quay lại
            </button>
          </div>
        )}
        <div className="inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          Tạo Ticket Mới
        </div>
        <h2 className="text-2xl my-2 text-gray-800">Chọn Loại Vấn Đề</h2>
        <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 mb-8 leading-relaxed">
          Vui lòng chọn loại vấn đề mà bạn đang gặp phải. Điều này giúp chúng tôi xử lý nhanh hơn và chuyển đến bộ phận phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 py-4 max-w-5xl mx-auto">
        {filteredIssueTypes.map((issueType) => (
          <div
            key={issueType.id}
            className="bg-white rounded-xl p-8 border-2 border-gray-200 cursor-pointer transition-all duration-300 ease-in-out flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500"
            onClick={() => onSelectIssue(issueType)}
          >
            <div className="text-5xl text-center mb-2">{issueType.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{issueType.name}</h3>
            <p className="text-sm text-gray-500 leading-relaxed text-center mb-4">{issueType.description}</p>
            
            {issueType.examples && issueType.examples.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mt-auto">
                <div className="text-[0.85rem] font-semibold text-gray-700 mb-2">Ví dụ:</div>
                <ul className="list-none p-0 m-0">
                  {issueType.examples.slice(0, 3).map((example, idx) => (
                    <li key={idx} className="text-xs text-gray-500 py-1 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueSelectionPage;

const ITStaffPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <span className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          IT Staff
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Trang IT Staff</h2>
        <p className="text-gray-600">Bạn đang ở trang dành cho IT Staff</p>
      </div>
      
      <div className="bg-white rounded-xl p-12 text-center shadow-sm border-2 border-gray-100 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">💻</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Chức năng dành cho IT Staff</h3>
        <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
          IT Staff xử lý các ticket về WiFi, Lab, CMS, LMS được IT Admin giao cho mình.
        </p>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">📋 Ticket được giao</h4>
          <p className="text-sm text-gray-600">Hiện chưa có ticket nào được giao</p>
        </div>
      </div>
    </div>
  );
};

export default ITStaffPage;


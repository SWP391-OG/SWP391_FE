const StaffPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="mb-8 text-center">
        <div className="inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          Staff
        </div>
        <h2 className="text-2xl my-2 text-gray-800">Trang Nhân viên</h2>
        <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
          Bạn đang ở trang dành cho Nhân viên
        </p>
      </div>
      
      <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
        <div className="text-[5rem] mb-6">👨‍💼</div>
        <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho Nhân viên</h3>
        <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto">
          Nhân viên có thể tiếp nhận, xử lý và cập nhật trạng thái các ticket theo SLA.
        </p>
      </div>
    </div>
  );
};

export default StaffPage;


const StaffPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-8">
      
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

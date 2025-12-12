import React from 'react';

interface ContactInfo {
  departmentName: string;
  address: string;
  email: string;
  workingHours: string;
}

const contactData: ContactInfo = {
  departmentName: 'Phòng Quản lý Cơ sở Vật chất',
  address: 'Tòa nhà A, Lầu 3, Phòng 301, Trường Đại học FPT',
  email: 'admin1@fpt.edu.vn', 
  workingHours: 'Thứ Hai - Thứ Sáu: 8:00 - 17:00 (Nghỉ trưa: 12:00 - 13:00)',
};

const Footer: React.FC = () => {
  return (
    // THÊM: mt-auto để đẩy footer xuống cuối
    <footer className="mt-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 shadow-lg"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h4 className="text-xl font-bold mb-2 border-b border-orange-400 pb-1">
                Hệ thống Phản ánh Cơ sở Vật chất
            </h4>
            <p className="text-orange-200 mt-3">
                &copy; {new Date().getFullYear()} Trường Đại học FPT.
            </p>
            <p className="text-orange-200">Bảo lưu mọi quyền.</p>
          </div>

          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h4 className="text-xl font-bold mb-2 border-b border-orange-400 pb-1">
                Liên hệ Phòng ban Xử lý
            </h4>
            <p className="mt-2">
              <strong className="text-white">Phòng ban:</strong> {contactData.departmentName}
            </p>
            <p>
              <strong className="text-white">Địa chỉ:</strong> {contactData.address}
            </p>
            <p>
              <strong className="text-white">Email:</strong> 
              <a href={`mailto:${contactData.email}`} className="text-yellow-200 hover:text-yellow-100 ml-1">
                {contactData.email}
              </a>
            </p>
          </div>
          
          <div className="w-full md:w-1/4">
            <h4 className="text-xl font-bold mb-2 border-b border-orange-400 pb-1">
                Giờ làm việc
            </h4>
            <p className="text-orange-200">
                {contactData.workingHours}
            </p>
            <p className="text-xs text-orange-400 mt-2">
                Mọi phản ánh sẽ được tiếp nhận và xử lý nhanh chóng.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
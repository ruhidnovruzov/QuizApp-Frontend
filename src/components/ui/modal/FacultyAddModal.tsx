import React, { useState } from 'react';

// Modal üçün ikon (sadə X işarəsi)
const CloseIcon = (props) => (
  <svg
    {...props}
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FacultyAddModal = ({ isOpen, onClose, onSubmit }) => {
  // Fakültə məlumatlarını saxlamaq üçün state
  const [fakulteAdi, setFakulteAdi] = useState('');
  const [fakulteKodu, setFakulteKodu] = useState('');

  // Əgər modal açıq deyilsə, heç nə göstərmə
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fakulteAdi.trim() || !fakulteKodu.trim()) {
      alert("Zəhmət olmasa hər iki sahəni doldurun.");
      return;
    }

    onSubmit({ fakulteAdi, fakulteKodu });

    // Sahələri təmizlə
    setFakulteAdi('');
    setFakulteKodu('');
    
    // Modalı bağla
    onClose();
  };

  return (
    // Modal Fonu (Overlay)
    <div className="fixed inset-0 bg-[#00000086] bg-opacity-50 flex items-center justify-center z-99999">
      
      {/* Modal Pəncərəsi */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100"
        // Overlay üzərinə klikləməklə modalı bağlamaq üçün
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Modal Başlığı */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Yeni Fakültə Yarat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition duration-150">
            <CloseIcon />
          </button>
        </div>

        {/* Modal Forması */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Fakültə Adı Inputu */}
          <div>
            <label htmlFor="fakulteAdi" className="block text-sm font-medium text-gray-700 mb-1">Fakültə Adı:</label>
            <input
              type="text"
              id="fakulteAdi"
              value={fakulteAdi}
              onChange={(e) => setFakulteAdi(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
              placeholder="Məsələn: İnformasiya Texnologiyaları"
              required
            />
          </div>

          {/* Fakültə Kodu Inputu */}
          <div>
            <label htmlFor="fakulteKodu" className="block text-sm font-medium text-gray-700 mb-1">Fakültə Kodu:</label>
            <input
              type="text"
              id="fakulteKodu"
              value={fakulteKodu}
              onChange={(e) => setFakulteKodu(e.target.value.toUpperCase())} // Kodu böyük hərflərlə yazaq
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
              placeholder="Məsələn: İT01"
              required
            />
          </div>
          
          {/* Əlavə Et Düyməsi (Modal Footer) */}
          <div className="flex justify-end pt-3 border-t -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 mr-3"
            >
              Ləğv Et
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 shadow-md"
            >
              Fakültə Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyAddModal;
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import { useState } from "react"
import FacultyAddModal from "../../components/ui/modal/FacultyAddModal";

const FacultiesPage = () => {

    // Sadəcə bir state istifadə edirik: modalın açıq olub-olmadığını idarə etmək üçün.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fakültə siyahısını saxlamaq üçün yeni state əlavə edirik (nümunə üçün)
    const [fakulteler, setFakulteler] = useState([
        { id: 1, name: "Apple MacBook Pro 17\"", code: "AMBP17" },
        { id: 2, name: "Microsoft Surface Pro", code: "MSP01" },
        // Nümunə məlumatları
    ]);
    
    /**
     * @param {{fakulteAdi: string, fakulteKodu: string}} yeniFakulte 
     */
    const handleAddFaculty = (yeniFakulte) => {
        // Yeni fakültəni mövcud siyahıya əlavə edir
        setFakulteler(prev => [
            ...prev,
            { id: Date.now(), name: yeniFakulte.fakulteAdi, code: yeniFakulte.fakulteKodu }
        ]);
        
        // Məlumatın əlavə edildiyini görmək üçün konsola yazırıq
        console.log("Yeni fakültə əlavə edildi:", yeniFakulte);
        
        // Modalın avtomatik bağlanması üçün
        setIsModalOpen(false);
    };

    return (
        <>
            <PageBreadcrumb pageTitle="Fakültələr" />
            
            {/* Table Header və Button */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="flex justify-end m-4">
                    <button 
                        type="button" 
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        // isModalOpen state-ini true edərək modalı açırıq
                        onClick={() => setIsModalOpen(true)} 
                    >
                        Fakültə Əlavə Et
                    </button>
                </div>
                
                {/* Table Content */}
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fakültə adı</th>
                            <th scope="col" className="px-6 py-3">Fakültə kodu</th>
                            <th scope="col" className="px-6 py-3">Kafedrlar</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fakulteler.map((fakulte) => (
                            <tr 
                                key={fakulte.id} 
                                className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {fakulte.name}
                                </th>
                                <td className="px-6 py-4">
                                    {fakulte.code}
                                </td>
                                {/* Kafedr sayıları üçün yer saxlanılır */}
                                <td className="px-6 py-4">
                                    Nümunə Kafedra
                                </td>
                                <td className="px-6 py-4">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Dəyişdir</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FacultyAddModal Komponenti */}
            <FacultyAddModal
                // Modalın görünürlüyü
                isOpen={isModalOpen}
                // Modalı bağlama funksiyası
                onClose={() => setIsModalOpen(false)}
                // Form göndərildikdə işə düşən funksiya
                onAddFaculty={handleAddFaculty}
            />
        </>
    );
}

export default FacultiesPage;
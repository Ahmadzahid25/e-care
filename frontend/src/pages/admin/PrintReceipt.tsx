import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '../../services/api';
import { Complaint, ComplaintRemark, TechnicianRemark } from '../../types';

export default function PrintReceipt() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [adminRemarks, setAdminRemarks] = useState<ComplaintRemark[]>([]);
    const [techRemarks, setTechRemarks] = useState<TechnicianRemark[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        try {
            const response = await api.get(`/complaints/${id}`);
            setComplaint(response.data.complaint);
            setAdminRemarks(response.data.adminRemarks);
            setTechRemarks(response.data.techRemarks);
        } catch (error) {
            console.error('Failed to load complaint');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ms-MY', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Aduan tidak dijumpai</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Controls - Hidden in print */}
            <div className="no-print bg-white shadow p-4 flex justify-between items-center">
                <Link to={`/admin/complaint/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>
                <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Cetak
                </button>
            </div>

            {/* Print Content */}
            <div className="max-w-3xl mx-auto p-8 bg-white my-8 shadow print:shadow-none print:m-0 print:max-w-full">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold">PTA SERVICES - E-CARE</h1>
                    <p className="text-sm text-gray-600">Pusat Servis Barangan Elektrik</p>
                    <p className="text-xs text-gray-500 mt-1">Besut, Terengganu</p>
                </div>

                <h2 className="text-lg font-bold text-center mb-6 uppercase">Laporan Aduan Kerosakan</h2>

                {/* Report Number */}
                <div className="flex justify-between items-center mb-6 p-3 bg-gray-100 rounded">
                    <span className="font-semibold">No Laporan:</span>
                    <span className="text-lg font-bold">{complaint.report_number}</span>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <h3 className="font-semibold border-b pb-2 mb-3">Maklumat Pelanggan</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">Nama:</span></div>
                        <div className="font-medium">{complaint.users?.full_name || '-'}</div>
                        <div><span className="text-gray-500">No IC:</span></div>
                        <div className="font-medium">{complaint.users?.ic_number || '-'}</div>
                        <div><span className="text-gray-500">No Telefon:</span></div>
                        <div className="font-medium">{complaint.users?.contact_no || '-'}</div>
                        <div><span className="text-gray-500">Alamat:</span></div>
                        <div className="font-medium">{complaint.users?.address || '-'}</div>
                    </div>
                </div>

                {/* Complaint Info */}
                <div className="mb-6">
                    <h3 className="font-semibold border-b pb-2 mb-3">Maklumat Aduan</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">Kategori:</span></div>
                        <div className="font-medium">{complaint.categories?.name || '-'}</div>
                        <div><span className="text-gray-500">Subkategori:</span></div>
                        <div className="font-medium">{complaint.subcategory}</div>
                        <div><span className="text-gray-500">Jenama:</span></div>
                        <div className="font-medium">{complaint.brand_name}</div>
                        <div><span className="text-gray-500">No Model:</span></div>
                        <div className="font-medium">{complaint.model_no || '-'}</div>
                        <div><span className="text-gray-500">Lokasi Pembelian:</span></div>
                        <div className="font-medium">{complaint.state}</div>
                        <div><span className="text-gray-500">Jenis Waranti:</span></div>
                        <div className="font-medium">{complaint.complaint_type}</div>
                        <div><span className="text-gray-500">Status:</span></div>
                        <div className="font-medium capitalize">{complaint.status === 'pending' ? 'Menunggu' : complaint.status === 'in_process' ? 'Dalam Proses' : 'Selesai'}</div>
                        <div><span className="text-gray-500">Tarikh Aduan:</span></div>
                        <div className="font-medium">{formatDate(complaint.created_at)}</div>
                    </div>
                </div>

                {/* Details */}
                <div className="mb-6">
                    <h3 className="font-semibold border-b pb-2 mb-3">Butiran Kerosakan</h3>
                    <p className="text-sm whitespace-pre-wrap">{complaint.details}</p>
                </div>

                {/* Technician */}
                {complaint.technicians && (
                    <div className="mb-6">
                        <h3 className="font-semibold border-b pb-2 mb-3">Juruteknik</h3>
                        <p className="text-sm">{complaint.technicians.name} ({complaint.technicians.department})</p>
                    </div>
                )}

                {/* Remarks */}
                {(adminRemarks.length > 0 || techRemarks.length > 0) && (
                    <div className="mb-6">
                        <h3 className="font-semibold border-b pb-2 mb-3">Catatan</h3>
                        <div className="space-y-3 text-sm">
                            {[...adminRemarks.map(r => ({ ...r, type: 'Admin' })), ...techRemarks.map(r => ({ ...r, type: 'Juruteknik' }))]
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                .map((remark, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{remark.type}</span>
                                            <span>{formatDate(remark.created_at)}</span>
                                        </div>
                                        {remark.remark && <p>{remark.remark}</p>}
                                        {remark.note_transport && <p><span className="text-gray-500">Nota Pengangkutan:</span> {remark.note_transport}</p>}
                                        {remark.checking && <p><span className="text-gray-500">Pemeriksaan:</span> {remark.checking}</p>}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Signature Section */}
                <div className="mt-12 pt-6 border-t print:break-inside-avoid">
                    <div className="flex justify-between items-end mt-12">
                        {/* Customer Signature */}
                        <div className="text-center w-64">
                            <div className="border-b border-black mb-2 h-20"></div>
                            <p className="font-bold">Tandatangan Pelanggan</p>
                            <p className="text-sm uppercase mt-1">{complaint.users?.full_name || '.....................................'}</p>
                            <p className="text-sm mt-1">Tarikh: ____________________</p>
                        </div>

                        {/* Technician Signature */}
                        <div className="text-center w-64">
                            <div className="border-b border-black mb-2 h-20"></div>
                            <p className="font-bold">Tandatangan Juruteknik</p>
                            <p className="text-sm uppercase mt-1">{complaint.technicians?.name || '.....................................'}</p>
                            <p className="text-sm mt-1">Tarikh: ____________________</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500 print:mt-auto">
                    <p>Dicetak pada: {new Date().toLocaleString('ms-MY')}</p>
                    <p className="mt-1">© 2025 PTA Services E-CARE. Hak Cipta Terpelihara.</p>
                </div>
            </div>
        </div>
    );
}

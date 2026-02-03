import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Users() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/admin/users?limit=1000');
            setUsers(response.data.users);
        } catch (error) {
            toast.error(t('common.error_load'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: 'Active' | 'Inactive' | 'Suspended') => {
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            toast.success(t('admin_users.status_updated'));
        } catch (error: any) {
            toast.error(error.response?.data?.error || t('admin_users.status_error'));
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.ic_number.includes(search) ||
        u.contact_no.includes(search)
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return <span className="badge bg-green-100 text-green-700">{t('admin_users.active')}</span>;
            case 'Inactive':
                return <span className="badge bg-gray-100 text-gray-700">{t('admin_users.inactive')}</span>;
            case 'Suspended':
                return <span className="badge bg-red-100 text-red-700">{t('admin_users.suspended')}</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ms-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout title={t('admin_users.title')} breadcrumb={t('admin_users.title')}>
            <div className="card">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder={t('admin_users.search_placeholder')}
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">{t('admin_users.no_users')}</p>
                    </div>
                ) : (<>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="table-header">
                                    <th className="text-left px-4 py-3 whitespace-nowrap">#</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">{t('common_actions.name')}</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">No IC</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">{t('admin_users.phone_number')}</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">{t('admin_master.title_states').replace('Pengurusan ', '')}</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">{t('common_actions.date')}</th>
                                    <th className="text-center px-4 py-3 whitespace-nowrap">{t('common_actions.status')}</th>
                                    <th className="text-center px-4 py-3 whitespace-nowrap">{t('common_actions.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user, index) => (
                                    <tr key={user.id} className="table-row">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <Link to={`/admin/users/${user.id}`} className="font-medium hover:text-indigo-600 transition-colors">
                                                    {user.full_name}
                                                </Link>
                                                <p className="text-xs text-gray-500">{user.email || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.ic_number}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.contact_no}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.state || '-'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">{formatDate(user.created_at)}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap">{getStatusBadge(user.status)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                {user.status !== 'Active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(user.id, 'Active')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title={t('admin_users.confirm_active')}
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {user.status !== 'Suspended' && (
                                                    <button
                                                        onClick={() => handleStatusChange(user.id, 'Suspended')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t('admin_users.confirm_suspend')}
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
                )}
            </div>
        </AdminLayout >
    );
}

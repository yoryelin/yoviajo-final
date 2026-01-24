import React from 'react';
import Layout from './Layout';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <Layout>
            <div className="flex flex-col md:flex-row gap-6">
                <AdminSidebar />
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </Layout>
    );
};

export default AdminLayout;

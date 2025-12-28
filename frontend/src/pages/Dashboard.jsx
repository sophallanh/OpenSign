import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { documentsAPI, leadsAPI, commissionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documents: 0,
    leads: 0,
    commissions: 0,
    totalEarnings: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [docsRes, leadsRes, commissionsRes] = await Promise.all([
        documentsAPI.getAll(),
        leadsAPI.getAll(),
        commissionsAPI.getAll()
      ]);

      setStats({
        documents: docsRes.data.count,
        leads: leadsRes.data.count,
        commissions: commissionsRes.data.count,
        totalEarnings: commissionsRes.data.totals?.paid || 0
      });

      setRecentDocuments(docsRes.data.documents.slice(0, 5));
      setRecentLeads(leadsRes.data.leads.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome back, {user?.name}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Documents</div>
          <div className="text-3xl font-bold text-gray-900">{stats.documents}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Leads</div>
          <div className="text-3xl font-bold text-gray-900">{stats.leads}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Commissions</div>
          <div className="text-3xl font-bold text-gray-900">{stats.commissions}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Earnings</div>
          <div className="text-3xl font-bold text-green-600">
            ${stats.totalEarnings.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <Link to="/documents" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentDocuments.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents yet</p>
            ) : (
              <ul className="space-y-3">
                {recentDocuments.map((doc) => (
                  <li key={doc._id} className="flex justify-between items-center">
                    <div>
                      <Link
                        to={`/documents/${doc._id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        {doc.title}
                      </Link>
                      <p className="text-xs text-gray-500">{doc.status}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        doc.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <Link to="/leads" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentLeads.length === 0 ? (
              <p className="text-gray-500 text-sm">No leads yet</p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((lead) => (
                  <li key={lead._id} className="flex justify-between items-center">
                    <div>
                      <Link
                        to={`/leads/${lead._id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        ${lead.loanAmount.toLocaleString()} - {lead.loanType}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'won'
                          ? 'bg-green-100 text-green-800'
                          : lead.status === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

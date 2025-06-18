"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import styles from './JobTracker.module.css';
import Layout from '../components/Layout/Layout';
import { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// Import icons for sorting direction
import { FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';

const JobTrackerPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 8;
  // NEW STATE FOR SORTING
  const [sortColumn, setSortColumn] = useState('applied_date'); // Default sort column
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchApplications();
    };

    fetchData();
  }, [router, sortColumn, sortDirection, statusFilter]); // Add sort states to dependencies

  const fetchApplications = async () => {
    setLoading(true);
    let query = supabase
      .from('job_applications')
      .select('*')
      .order(sortColumn, { ascending: sortDirection === 'asc' }); // Use sortColumn and sortDirection

    if (statusFilter !== 'All') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error) {
      setApplications(data || []);
    } else {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchApplications();
    } else {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchApplications();
      } else {
        console.error("Error deleting application:", error);
      }
    }
  };

  // NEW FUNCTION TO HANDLE SORTING CLICK
  const handleSort = (column) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, set it as the sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on new sort
  };

  const getSortIcon = (column) => {
    if (sortColumn === column) {
      if (column === 'applied_date') {
        return sortDirection === 'asc' ? <FaSortNumericUp /> : <FaSortNumericDown />;
      }
      return sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />;
    }
    return null; // No icon if not the currently sorted column
  };

  const filteredApplications = applications.filter(app => 
    app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const statusOptions = ['All', 'Applied', 'Interview', 'Offered', 'Rejected'];

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your job applications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Pelacak Lamaran Kerja</h1>
<p>Kelola dan lacak semua lamaran pekerjaan Anda dalam satu tempat</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari Berdasarkan perusahan atau posisi.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterContainer}>
              <FiFilter className={styles.filterIcon} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => router.push('/job-tracker/new')}
              className={styles.addButton}
            >
              <FiPlus /> Tambah lamaran
            </button>
          </div>
        </div>

        {currentApplications.length > 0 ? (
          <>
            <div className={styles.statsSummary}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{applications.length}</span>
                <span className={styles.statLabel}>Jumlah Seluruh Lamaran</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {applications.filter(app => app.status === 'Interview').length}
                </span>
                <span className={styles.statLabel}>Tahap Wawancara</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {applications.filter(app => app.status === 'Offered').length}
                </span>
<span className={styles.statLabel}>Penawaran Kerja</span>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.applicationsTable}>
                <thead>
                  <tr>
                    {/* Make headers clickable for sorting */}
                    <th onClick={() => handleSort('company_name')} className={styles.sortableHeader}>
                      Perusahaan {getSortIcon('company_name')}
                    </th>
                    <th onClick={() => handleSort('job_title')} className={styles.sortableHeader}>
                      Posisi {getSortIcon('job_title')}
                    </th>
                    <th onClick={() => handleSort('applied_date')} className={styles.sortableHeader}>
                      Tanggal Lamaran {getSortIcon('applied_date')}
                    </th>
                    <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                      Status {getSortIcon('status')}
                    </th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className={styles.companyCell}>
                          {app.company_logo && (
                            <img 
                              src={app.company_logo} 
                              alt={app.company_name} 
                              className={styles.companyLogo} 
                            />
                          )}
                          <span>{app.company_name}</span>
                        </div>
                      </td>
                      <td>{app.job_title}</td>
                      <td>{new Date(app.applied_date).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`${styles.statusSelect} ${styles[app.status.toLowerCase()]}`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => router.push(`/job-tracker/edit/${app.id}`)}
                            className={styles.editButton}
                          >
                            <FiEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className={styles.deleteButton}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <FiChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
                <h3> Tidak ada lamaran yang di temukan</h3>
<p>Anda belum menambahkan lamaran kerja apa pun. Mulailah melacak pencarian kerja Anda dengan menambahkan lamaran pertama.</p>
            <button 
              onClick={() => router.push('/job-tracker/new')}
              className={styles.primaryButton}
            >
              <FiPlus /> Tambah lamaran pertama Anda
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobTrackerPage;
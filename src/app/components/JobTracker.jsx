"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../../app/dashboard/Dashboard.module.css'; // Pastikan path ini benar

const JobTracker = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk form input penambahan
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [notes, setNotes] = useState('');
    
    const statusOptions = ['Dilamar', 'Wawancara', 'Ditolak', 'Diterima', 'Tawaran'];

    // State untuk Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);

    // Mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*')
                .order('application_date', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching job applications:", error);
            alert("Gagal memuat data lamaran.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddApplication = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();

        if (!company || !title || !user) return;

        try {
            const { error } = await supabase
                .from('job_applications')
                .insert({ 
                    company_name: company, 
                    job_title: title, 
                    job_url: jobUrl,
                    notes: notes,
                    user_id: user.id,
                    application_date: new Date().toISOString(),
                    status: 'Dilamar'
                });

            if (error) throw error;
            
            // Reset form setelah berhasil
            setCompany('');
            setTitle('');
            setJobUrl('');
            setNotes('');
            await fetchApplications(); // Refresh tabel
        } catch (error) {
            console.error("Error adding application:", error);
            alert(error.message);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('job_applications')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setApplications(currentApps => 
                currentApps.map(app => 
                    app.id === id ? { ...app, status: newStatus } : app
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            alert(error.message);
        }
    };

    const handleDeleteApplication = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus lamaran ini?")) {
            try {
                const { error } = await supabase.from('job_applications').delete().eq('id', id);
                if (error) throw error;
                fetchApplications(); // Refresh tabel
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const openEditModal = (app) => {
        setEditingApp(app);
        setIsModalOpen(true);
    };

    const handleUpdateApplication = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('job_applications')
                .update({ 
                    company_name: editingApp.company_name,
                    job_title: editingApp.job_title,
                    job_url: editingApp.job_url,
                    notes: editingApp.notes
                })
                .eq('id', editingApp.id);

            if (error) throw error;
            
            setIsModalOpen(false);
            fetchApplications(); // Refresh tabel
        } catch (error) {
            alert(error.message);
        }
    };
    
    return (
        <div>
            <form onSubmit={handleAddApplication} className={styles.addFormContainer}>
                <h3 className={styles.addFormTitle}>Tambah Lamaran Baru</h3>
                
                <div className={styles.mainInputsGrid}>
                    <input type="text" placeholder="Nama Perusahaan*" value={company} onChange={e => setCompany(e.target.value)} className={styles.formInput} required />
                    <input type="text" placeholder="Posisi yang Dilamar*" value={title} onChange={e => setTitle(e.target.value)} className={styles.formInput} required />
                    <button type="submit" className={styles.formButton}>Tambah Lamaran</button>
                </div>
                
                <div className={styles.secondaryInputs}>
                    <input type="url" placeholder="Link Lamaran (Opsional)" value={jobUrl} onChange={e => setJobUrl(e.target.value)} className={styles.formInput} />
                    <textarea placeholder="Catatan (Opsional)" value={notes} onChange={e => setNotes(e.target.value)} className={`${styles.formInput} w-full`} rows="2"></textarea>
                </div>
            </form>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={styles.th}>Perusahaan & Posisi</th>
                            <th className={styles.th}>Tanggal</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Loading...</td></tr>
                        ) : applications.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Belum ada lamaran yang dilacak.</td></tr>
                        ) : (
                            applications.map(app => (
                                <tr key={app.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        {app.job_url ? (
                                            <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                                                {app.company_name}
                                            </a>
                                        ) : (
                                            <span className="font-semibold">{app.company_name}</span>
                                        )}
                                        <p className="text-sm text-gray-600">{app.job_title}</p>
                                    </td>
                                    <td className={styles.td}>{new Date(app.application_date).toLocaleDateString('id-ID')}</td>
                                    <td className={styles.td}>
                                        <select value={app.status} onChange={(e) => handleUpdateStatus(app.id, e.target.value)} className={styles.statusSelect}>
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </td>
                                   <td className={styles.td}>
    <div className={styles.buttonGroup}>
        <button 
            onClick={() => openEditModal(app)} 
            className={styles.actionButtonEdit}
        >
            Edit
        </button>
        <button 
            onClick={() => handleDeleteApplication(app.id)} 
            className={styles.actionButtonDelete}
        >
            Hapus
        </button>
    </div>
</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingApp && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Edit Lamaran</h3>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateApplication}>
                            <div className={styles.modalBody}>
                                <input type="text" placeholder="Nama Perusahaan" value={editingApp.company_name} onChange={e => setEditingApp({...editingApp, company_name: e.target.value})} className={styles.formInput} required />
                                <input type="text" placeholder="Posisi" value={editingApp.job_title} onChange={e => setEditingApp({...editingApp, job_title: e.target.value})} className={styles.formInput} required />
                                <input type="url" placeholder="Link Lamaran" value={editingApp.job_url || ''} onChange={e => setEditingApp({...editingApp, job_url: e.target.value})} className={styles.formInput} />
                                <textarea placeholder="Catatan" value={editingApp.notes || ''} onChange={e => setEditingApp({...editingApp, notes: e.target.value})} className={`${styles.formInput} w-full`} rows="3"></textarea>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.actionButton} style={{backgroundColor: '#6b7280'}}>Batal</button>
                                <button type="submit" className={styles.formButton}>Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobTracker;
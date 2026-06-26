import { useState, useCallback } from 'react';
import * as documentService from '../services/documentService';
import toast from 'react-hot-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await documentService.getDocuments(params);
      setDocuments(data.documents);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDoc = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const toggleFav = async (id) => {
    try {
      const { data } = await documentService.toggleFavorite(id);
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, favoritedBy: data.document.favoritedBy } : d));
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return { documents, loading, pagination, fetchDocuments, deleteDoc, toggleFav, setDocuments };
}

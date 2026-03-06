import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";

export const useTickets = (filters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await API.get(`/tickets?${params.toString()}`);
      setTickets(data.tickets);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, pagination, loading, error, refetch: fetchTickets };
};

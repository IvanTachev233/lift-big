import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

interface LeaderboardEntry {
  username: string;
  total_weight_lifted: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource('http://localhost:3000/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Live Leaderboard Update:', data);
        if (Array.isArray(data)) {
          setLeaderboard(data);
          setError(null);
        } else {
          console.error('Leaderboard data is not an array:', data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to parse leaderboard update:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      // Don't set error state immediately on connection error to avoid flashing
      // EventSource will try to reconnect automatically
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection to live updates lost.');
      }
    };

    // Initial fetch fallback (optional, but good for immediate data if SSE takes a moment)
    // Actually, our SSE handler sends initial data immediately on connection!

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className='card shadow-sm' style={{ width: '100%' }}>
      {/* Header */}
      <div className='card-header bg-white d-flex justify-content-between align-items-center py-3'>
        <h6 className='m-0 font-weight-bold text-dark'>Top Athletes</h6>
        <span className='badge bg-success bg-opacity-10 text-success border border-success'>
          ● LIVE
        </span>
      </div>

      {/* Body */}
      <div className='card-body p-0'>
        {loading && (
          <div className='text-center p-4'>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </div>
        )}
        {error && (
          <Alert variant='danger' className='m-3'>
            {error}
          </Alert>
        )}
        {!loading &&
          !error &&
          (leaderboard.length > 0 ? (
            <table className='table table-hover table-sm mb-0'>
              <thead className='table-light text-muted'>
                <tr>
                  <th scope='col' className='ps-3 border-0'>
                    Rank
                  </th>
                  <th scope='col' className='border-0'>
                    User
                  </th>
                  <th scope='col' className='text-end pe-3 border-0'>
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={index}>
                      {/* Rank Column */}
                      <td className='align-middle ps-3'>
                        <span
                          className={`badge rounded-pill ${
                            rank === 1
                              ? 'bg-warning text-dark' // Gold
                              : rank === 2
                                ? 'bg-secondary' // Silver
                                : rank === 3
                                  ? 'bg-danger' // Bronze (ish)
                                  : 'bg-light text-secondary border' // Others
                          }`}
                          style={{ width: '25px' }}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Name Column */}
                      <td
                        className='align-middle fw-semibold text-dark'
                        style={{ fontSize: '0.9rem' }}
                      >
                        {entry.username}
                      </td>

                      {/* Score Column */}
                      <td className='align-middle text-end pe-3 font-monospace text-primary'>
                        {entry.total_weight_lifted.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className='text-center mb-0 p-3'>No data available.</p>
          ))}
      </div>

      {/* Footer */}
      <div className='card-footer bg-light text-center border-top-0 py-2'>
        <a href='#' className='text-decoration-none text-primary' style={{ fontSize: '0.85rem' }}>
          View Full Rankings &rarr;
        </a>
      </div>
    </div>
  );
};

export default Leaderboard;

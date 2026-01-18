import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

import { LiveBadge } from './design-system';

interface LeaderboardEntry {
  username: string;
  total_weight_lifted: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const sseUrl = import.meta.env.VITE_SSE_URL || 'http://localhost:3000/events';
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setLeaderboard(data);
          setError(null);
        } else {
          console.error('Leaderboard data is not an array:', data);
        }
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

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Card>
      <Card.Header className='d-flex justify-content-between align-items-center'>
        <span>
          <i className='bi bi-trophy-fill text-warning me-2'></i>Top Athletes
        </span>
        <LiveBadge />
      </Card.Header>

      <Card.Body className='p-0'>
        {error && (
          <Alert variant='danger' className='m-3'>
            {error}
          </Alert>
        )}
        {!error &&
          (leaderboard.length > 0 ? (
            <Table hover className='align-middle mb-0'>
              <thead>
                <tr>
                  <th className='ps-4' style={{ width: '50px' }}>
                    Rank
                  </th>
                  <th>User</th>
                  <th className='text-end pe-4'>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={index}>
                      <td className='ps-4'>
                        <Badge
                          pill
                          bg={
                            rank === 1
                              ? 'warning'
                              : rank === 2
                                ? 'secondary'
                                : rank === 3
                                  ? 'danger'
                                  : 'light'
                          }
                          text={rank === 1 ? 'dark' : undefined}
                          className={rank > 3 ? 'border' : ''}
                        >
                          {rank}
                        </Badge>
                      </td>
                      <td className='fw-bold' style={{ color: 'var(--text-main)' }}>
                        {entry.username}
                      </td>
                      <td className='text-end pe-4 font-data text-primary'>
                        {entry.total_weight_lifted.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p className='text-center text-muted mb-0 p-3'>No data available.</p>
          ))}
      </Card.Body>
    </Card>
  );
};

export default Leaderboard;

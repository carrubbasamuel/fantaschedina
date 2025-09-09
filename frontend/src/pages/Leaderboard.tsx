import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { betsAPI } from '../services/api';
import { LeaderboardEntry } from '../types';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await betsAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Errore nel caricamento della classifica');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge bg="warning">🥇 1°</Badge>;
    if (position === 2) return <Badge bg="secondary">🥈 2°</Badge>;
    if (position === 3) return <Badge bg="dark">🥉 3°</Badge>;
    return <Badge bg="light" text="dark">{position}°</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>🏆 Classifica Generale</h4>
              <small className="text-muted">Basata sul punteggio totale di tutte le giornate</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {leaderboard.length === 0 ? (
                <Alert variant="info">
                  Nessuna schedina valutata ancora. La classifica apparirà dopo la prima giornata completata.
                </Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Posizione</th>
                      <th>Username</th>
                      <th className="text-center">Punteggio Totale</th>
                      <th className="text-center">Giornate Giocate</th>
                      <th className="text-center">Media</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.position}>
                        <td className="text-center">
                          {getPositionBadge(entry.position)}
                        </td>
                        <td>
                          <strong>{entry.username}</strong>
                        </td>
                        <td className="text-center">
                          <Badge bg="primary" style={{ fontSize: '1rem' }}>
                            {entry.totalScore}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {entry.gamesPlayed}
                        </td>
                        <td className="text-center">
                          <Badge bg="secondary">
                            {entry.averageScore?.toFixed(2)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Header>
              <h5>📋 Come funziona il punteggio</h5>
            </Card.Header>
            <Card.Body>
              <ul className="mb-0">
                <li><strong>1 punto</strong> per ogni risultato indovinato correttamente</li>
                <li><strong>0 punti</strong> per risultati sbagliati</li>
                <li>Il <strong>punteggio totale</strong> è la somma di tutti i punti ottenuti</li>
                <li>La <strong>media</strong> è calcolata dividendo il punteggio totale per le giornate giocate</li>
                <li>In caso di parità nel punteggio totale, vince chi ha la media più alta</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Leaderboard;

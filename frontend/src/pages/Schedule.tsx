import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { gamedaysAPI } from '../services/api';
import { Gameday } from '../types';

const Schedule: React.FC = () => {
  const [gamedays, setGamedays] = useState<Gameday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGamedays = async () => {
      try {
        const data = await gamedaysAPI.getAll();
        setGamedays(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Errore nel caricamento delle giornate');
      } finally {
        setLoading(false);
      }
    };

    fetchGamedays();
  }, []);

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
          <h2>📅 Calendario delle Giornate</h2>
          <p className="text-muted">Tutte le giornate del campionato Fantaschedine</p>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {gamedays.length === 0 ? (
            <Alert variant="info">
              Nessuna giornata disponibile. Le giornate verranno create dall'amministratore.
            </Alert>
          ) : (
            <Row>
              {gamedays.map((gameday) => (
                <Col key={gameday._id} md={6} lg={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Giornata {gameday.number}</h5>
                      {gameday.isActive && (
                        <Badge bg="success">Attiva</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <h6 className="text-primary">{gameday.name}</h6>
                      <p className="text-muted mb-2">
                        <small>
                          📅 {new Date(gameday.startDate).toLocaleDateString('it-IT')} - 
                          {new Date(gameday.endDate).toLocaleDateString('it-IT')}
                        </small>
                      </p>
                      
                      {gameday.isActive && (
                        <Alert variant="success" className="py-2 mb-0">
                          🎯 Giornata in corso!
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Schedule;

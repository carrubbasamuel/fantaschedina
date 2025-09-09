import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { betsAPI } from '../services/api';
import { Bet } from '../types';

const MyBets: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyBets = async () => {
      try {
        setLoading(true);
        const data = await betsAPI.getMyBets();
        setBets(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Errore nel caricamento delle schedine');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h4>📋 Le Mie Schedine</h4>
              <small className="text-muted">Storico di tutte le tue schedine</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {bets.length === 0 ? (
                <Alert variant="info">
                  Non hai ancora giocato nessuna schedina. Vai alla sezione "Nuova Schedina" per iniziare!
                </Alert>
              ) : (
                <div>
                  {bets.map((bet) => (
                    <Card key={bet._id} className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">
                            {typeof bet.gameday === 'object' ? bet.gameday.name : `Giornata ${bet.gameday}`}
                          </h6>
                          <small className="text-muted">
                            Giocata il {formatDate(bet.createdAt)}
                          </small>
                        </div>
                        <div>
                          {bet.isEvaluated ? (
                            <Badge bg="success" style={{ fontSize: '1rem' }}>
                              {bet.score}/{bet.predictions.length} punti
                            </Badge>
                          ) : (
                            <Badge bg="warning">In attesa di risultati</Badge>
                          )}
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Partita</th>
                              <th className="text-center">La tua predizione</th>
                              <th className="text-center">Risultato</th>
                              <th className="text-center">Esito</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bet.predictions.map((prediction, index) => {
                              const match = typeof prediction.match === 'object' ? prediction.match as any : null;
                              const isCorrect = match && match.result === prediction.prediction;
                              
                              return (
                                <tr key={index}>
                                  <td>
                                    {match && match.homeTeam && match.awayTeam ? (
                                      `${match.homeTeam.name} vs ${match.awayTeam.name}`
                                    ) : (
                                      `Partita ${index + 1}`
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <Badge bg="primary">{prediction.prediction}</Badge>
                                  </td>
                                  <td className="text-center">
                                    {match && match.result ? (
                                      <Badge bg="secondary">{match.result}</Badge>
                                    ) : (
                                      <small className="text-muted">-</small>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {bet.isEvaluated ? (
                                      isCorrect ? (
                                        <Badge bg="success">✓</Badge>
                                      ) : (
                                        <Badge bg="danger">✗</Badge>
                                      )
                                    ) : (
                                      <small className="text-muted">-</small>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  {/* Riepilogo statistiche */}
                  <Card className="mt-4">
                    <Card.Header>
                      <h5>📊 Le tue statistiche</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={3}>
                          <div className="text-center">
                            <h3 className="text-primary">{bets.length}</h3>
                            <small className="text-muted">Schedine giocate</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h3 className="text-success">
                              {bets.filter(bet => bet.isEvaluated).length}
                            </h3>
                            <small className="text-muted">Schedine valutate</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h3 className="text-warning">
                              {bets.filter(bet => bet.isEvaluated).reduce((sum, bet) => sum + bet.score, 0)}
                            </h3>
                            <small className="text-muted">Punti totali</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <h3 className="text-info">
                              {bets.filter(bet => bet.isEvaluated).length > 0 ? (
                                (bets.filter(bet => bet.isEvaluated).reduce((sum, bet) => sum + bet.score, 0) / 
                                 bets.filter(bet => bet.isEvaluated).length).toFixed(2)
                              ) : '0.00'}
                            </h3>
                            <small className="text-muted">Media punti</small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyBets;

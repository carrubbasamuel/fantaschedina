import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { betsAPI, gamedaysAPI } from '../services/api';
import { Bet, GamedayWithMatches } from '../types';

const Dashboard: React.FC = () => {
  const [activeGameday, setActiveGameday] = useState<GamedayWithMatches | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ottieni la giornata attiva solo se l'utente è approvato
        if (user?.isApproved) {
          const gamedayData = await gamedaysAPI.getActive();
          setActiveGameday(gamedayData);

          // Controlla se l'utente ha già scommesso
          try {
            const bet = await betsAPI.getByGameday(gamedayData.gameday._id);
            setUserBet(bet);
          } catch (betError) {
            // L'utente non ha ancora scommesso per questa giornata
            setUserBet(null);
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          setError(error.response?.data?.message || 'Errore nel caricamento dei dati');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

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
          <h2>Benvenuto, {user?.username}!</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Sezione squadra assegnata */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <h5>🏆 La tua squadra</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  {user?.team ? (
                    <>
                      {user.team.logo && (
                        <img 
                          src={user.team.logo} 
                          alt={`Logo ${user.team.name}`}
                          style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                          className="mb-3"
                        />
                      )}
                      <h4 className="text-primary">{user.team.name}</h4>
                      {user.isApproved ? (
                        <Badge bg="success" className="fs-6">✅ Account Approvato</Badge>
                      ) : (
                        <Badge bg="warning" className="fs-6">⏳ In attesa di approvazione</Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-muted mb-3">
                        <i className="bi bi-person-x" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="text-muted">Nessuna squadra assegnata</h5>
                      <p className="text-muted">Aspetta che l'amministratore ti assegni una squadra</p>
                      <Badge bg="warning" className="fs-6">⏳ In attesa di assegnazione</Badge>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <h5>📊 Le tue statistiche</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col>
                      <h4 className="text-primary">0</h4>
                      <small className="text-muted">Schedine giocate</small>
                    </Col>
                    <Col>
                      <h4 className="text-success">0</h4>
                      <small className="text-muted">Punti totali</small>
                    </Col>
                    <Col>
                      <h4 className="text-warning">-</h4>
                      <small className="text-muted">Posizione</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Controllo approvazione utente */}
          {!user?.isApproved ? (
            <Alert variant="warning">
              <h5>⏳ Account in attesa di approvazione</h5>
              <p>Il tuo account è stato creato con successo! 
                 Ora devi aspettare che l'amministratore ti assegni una squadra del fantacalcio.</p>
              <p><strong>Una volta assegnata la squadra, potrai iniziare a giocare le schedine!</strong></p>
            </Alert>
          ) : (
            <>
              {user?.team && (
                <Alert variant="success">
                  <strong>✅ Account approvato!</strong> 
                  <br />Giochi per la squadra: <strong>{user.team.name}</strong>
                </Alert>
              )}
              
              {activeGameday ? (
                <Row>
                  <Col md={8}>
                    <Card>
                      <Card.Header>
                        <h4>{activeGameday.gameday.name}</h4>
                        <small className="text-muted">
                          Giornata {activeGameday.gameday.number}
                        </small>
                      </Card.Header>
                      <Card.Body>
                        <h5>Partite della giornata:</h5>
                        <div className="mb-3">
                          {activeGameday.matches.map((match) => (
                            <div key={match._id} className="border p-2 mb-2 rounded">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>
                                  <strong>Partita {match.matchNumber}:</strong> {match.homeTeam.name} vs {match.awayTeam.name}
                                </span>
                                {match.isCompleted && match.result && (
                                  <span className="badge bg-success">
                                    Risultato: {match.result}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {userBet ? (
                          <Alert variant="success">
                            ✅ Hai già giocato la schedina per questa giornata!
                            {userBet.isEvaluated && (
                              <div className="mt-2">
                                <strong>Il tuo punteggio: {userBet.score}/{userBet.predictions.length}</strong>
                              </div>
                            )}
                          </Alert>
                        ) : (
                          <div>
                            <Alert variant="warning">
                              ⚠️ Non hai ancora giocato la schedina per questa giornata!
                            </Alert>
                            <Link to="/bet">
                              <Button variant="primary" size="lg">
                                Gioca la tua schedina
                              </Button>
                            </Link>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card>
                      <Card.Header>
                        <h5>Azioni rapide</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-2">
                          <Link to="/leaderboard">
                            <Button variant="outline-primary" className="w-100">
                              📊 Classifica Generale
                            </Button>
                          </Link>
                          <Link to="/my-bets">
                            <Button variant="outline-secondary" className="w-100">
                              📋 Le Mie Schedine
                            </Button>
                          </Link>
                          {!userBet && (
                            <Link to="/bet">
                              <Button variant="success" className="w-100">
                                ⚽ Nuova Schedina
                              </Button>
                            </Link>
                          )}
                          {user?.isAdmin && (
                            <Link to="/admin">
                              <Button variant="warning" className="w-100">
                                🔧 Pannello Admin
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                    
                    {userBet && (
                      <Card className="mt-3">
                        <Card.Header>
                          <h6>La tua schedina</h6>
                        </Card.Header>
                        <Card.Body>
                          {userBet.predictions.map((prediction, index) => (
                            <div key={index} className="small mb-1">
                              Partita {index + 1}: <strong>{prediction.prediction}</strong>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
              ) : (
                <Alert variant="info">
                  Non ci sono giornate attive al momento. Contatta l'amministratore per attivare una nuova giornata.
                </Alert>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { gamedaysAPI, matchesAPI, teamsAPI } from '../services/api';
import { Gameday, Match, Team } from '../types';

const GamedayManagement: React.FC = () => {
  const [gamedays, setGamedays] = useState<Gameday[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameday, setSelectedGameday] = useState<Gameday | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [matchForm, setMatchForm] = useState({
    homeTeam: '',
    awayTeam: '',
    matchNumber: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gamedaysData, teamsData] = await Promise.all([
        gamedaysAPI.getAll(),
        teamsAPI.getAll()
      ]);
      setGamedays(gamedaysData);
      setTeams(teamsData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (gamedayId: string) => {
    try {
      const matchesData = await matchesAPI.getByGameday(gamedayId);
      setMatches(matchesData);
    } catch (error: any) {
      setMatches([]);
    }
  };

  const handleSelectGameday = async (gameday: Gameday) => {
    setSelectedGameday(gameday);
    await fetchMatches(gameday._id);
  };

  const handleAddMatch = () => {
    setMatchForm({
      homeTeam: '',
      awayTeam: '',
      matchNumber: matches.length + 1
    });
    setShowModal(true);
  };

  const handleSaveMatch = async () => {
    if (!selectedGameday || !matchForm.homeTeam || !matchForm.awayTeam) return;
    
    if (matchForm.homeTeam === matchForm.awayTeam) {
      setError('Una squadra non può giocare contro se stessa');
      return;
    }

    try {
      await matchesAPI.create({
        gamedayId: selectedGameday._id,
        homeTeam: matchForm.homeTeam,
        awayTeam: matchForm.awayTeam,
        matchNumber: matchForm.matchNumber
      });
      
      setShowModal(false);
      await fetchMatches(selectedGameday._id);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nel salvataggio della partita');
    }
  };

  const handleActivateGameday = async (gameday: Gameday) => {
    try {
      await gamedaysAPI.activate(gameday._id);
      await fetchData();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nell\'attivazione della giornata');
    }
  };

  const handleCloseBetting = async (gameday: Gameday) => {
    if (!window.confirm(`Sei sicuro di voler chiudere le scommesse per la ${gameday.name}?`)) {
      return;
    }
    
    try {
      await gamedaysAPI.closeBetting(gameday._id);
      await fetchData();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nella chiusura delle scommesse');
    }
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
          <h2>⚽ Gestione Giornate e Partite</h2>
          <p className="text-muted">Aggiungi partite alle giornate e gestisci le scommesse</p>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            {/* Lista giornate */}
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>📅 Giornate del Campionato</h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {gamedays.map((gameday) => (
                    <Card 
                      key={gameday._id} 
                      className={`mb-2 cursor-pointer ${selectedGameday?._id === gameday._id ? 'border-primary' : ''}`}
                      onClick={() => handleSelectGameday(gameday)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Giornata {gameday.number}</strong>
                            <br />
                            <small className="text-muted">{gameday.name}</small>
                          </div>
                          <div>
                            {gameday.isActive && (
                              <Badge bg="success" className="me-1">Attiva</Badge>
                            )}
                            {gameday.bettingClosed && (
                              <Badge bg="danger">Chiusa</Badge>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Gestione partite */}
            <Col md={6}>
              {selectedGameday ? (
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5>🏟️ Partite - {selectedGameday.name}</h5>
                    <div>
                      {!selectedGameday.isActive && matches.length === 4 && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleActivateGameday(selectedGameday)}
                        >
                          ▶️ Attiva Giornata
                        </Button>
                      )}
                      {selectedGameday.isActive && !selectedGameday.bettingClosed && (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleCloseBetting(selectedGameday)}
                        >
                          🔒 Chiudi Scommesse
                        </Button>
                      )}
                      {matches.length < 4 && !selectedGameday.bettingClosed && (
                        <Button variant="primary" size="sm" onClick={handleAddMatch}>
                          + Aggiungi Partita
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {matches.length === 0 ? (
                      <Alert variant="info">
                        Nessuna partita configurata per questa giornata.
                        <br />
                        <strong>Aggiungi 4 partite per rendere la giornata giocabile.</strong>
                      </Alert>
                    ) : (
                      <>
                        <Table striped>
                          <thead>
                            <tr>
                              <th>Match</th>
                              <th>Casa</th>
                              <th>Ospite</th>
                              <th>Risultato</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matches.map((match) => (
                              <tr key={match._id}>
                                <td>{match.matchNumber}</td>
                                <td>{match.homeTeam.name}</td>
                                <td>{match.awayTeam.name}</td>
                                <td>
                                  {match.result ? (
                                    <Badge bg="success">{match.result}</Badge>
                                  ) : (
                                    <Badge bg="secondary">-</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        
                        {matches.length === 4 ? (
                          <Alert variant="success">
                            ✅ Giornata completa! {selectedGameday.isActive ? 'Giornata attiva.' : 'Puoi attivarla.'}
                          </Alert>
                        ) : (
                          <Alert variant="warning">
                            ⚠️ Partite configurate: {matches.length}/4. Aggiungi {4 - matches.length} partite per completare la giornata.
                          </Alert>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center">
                    <h5 className="text-muted">Seleziona una giornata</h5>
                    <p className="text-muted">Clicca su una giornata a sinistra per gestire le sue partite</p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal per aggiungere partita */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi Partita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Squadra Casa</Form.Label>
                  <Form.Select
                    value={matchForm.homeTeam}
                    onChange={(e) => setMatchForm({...matchForm, homeTeam: e.target.value})}
                  >
                    <option value="">Seleziona squadra casa</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Squadra Ospite</Form.Label>
                  <Form.Select
                    value={matchForm.awayTeam}
                    onChange={(e) => setMatchForm({...matchForm, awayTeam: e.target.value})}
                  >
                    <option value="">Seleziona squadra ospite</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id} disabled={team._id === matchForm.homeTeam}>
                        {team.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annulla
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveMatch}
            disabled={!matchForm.homeTeam || !matchForm.awayTeam}
          >
            Salva Partita
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GamedayManagement;

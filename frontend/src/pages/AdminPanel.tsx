import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { adminAPI, gamedaysAPI } from '../services/api';
import { Team, User } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [seasonInitialized, setSeasonInitialized] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAvailableTeams()
      ]);
      setUsers(usersData);
      setAvailableTeams(teamsData);
      
      // Controlla se le giornate sono già inizializzate
      try {
        const gamedays = await gamedaysAPI.getAll();
        setSeasonInitialized(gamedays.length > 0);
      } catch (error) {
        setSeasonInitialized(false);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSeason = async () => {
    if (!window.confirm('Sei sicuro di voler inizializzare tutte le 35 giornate del campionato? Questa operazione può essere fatta solo una volta.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await gamedaysAPI.initializeSeason();
      setSeasonInitialized(true);
      setError('');
      alert(`Successo! ${result.message}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nell\'inizializzazione del campionato');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeason = async () => {
    if (!window.confirm('ATTENZIONE: Questa operazione cancellerà TUTTE le giornate e partite esistenti. Sei sicuro di voler continuare?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await gamedaysAPI.resetSeason();
      setSeasonInitialized(false);
      setError('');
      alert(`Successo! ${result.message}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nel reset della stagione');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeam = (user: User) => {
    setSelectedUser(user);
    setSelectedTeam('');
    setShowModal(true);
  };

  const confirmAssignTeam = async () => {
    if (!selectedUser || !selectedTeam) return;

    try {
      await adminAPI.assignTeam(selectedUser.id, selectedTeam);
      setShowModal(false);
      fetchData(); // Ricarica i dati
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nell\'assegnazione della squadra');
    }
  };

  const handleRemoveTeam = async (user: User) => {
    if (!window.confirm(`Sei sicuro di voler rimuovere la squadra da ${user.username}?`)) {
      return;
    }

    try {
      await adminAPI.removeTeam(user.id);
      fetchData(); // Ricarica i dati
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nella rimozione della squadra');
    }
  };

  const handleDeleteUser = async (user: User) => {
    console.log('🔍 Eliminazione utente:', user.id, user.username);
    
    if (!window.confirm(`Sei sicuro di voler eliminare l'utente ${user.username}? Questa azione è irreversibile e libererà automaticamente la sua squadra.`)) {
      return;
    }

    try {
      console.log('📡 Chiamata API per eliminare:', user.id);
      await adminAPI.deleteUser(user.id);
      fetchData(); // Ricarica i dati
      setError('');
    } catch (error: any) {
      console.error('❌ Errore eliminazione:', error);
      setError(error.response?.data?.message || 'Errore nell\'eliminazione dell\'utente');
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
          <Card>
            <Card.Header>
              <h4>🔧 Pannello Amministratore</h4>
              <small className="text-muted">Gestisci gli utenti e assegna le squadre</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {/* Sezione Azioni Amministrative */}
              <Card className="mb-4">
                <Card.Header>
                  <h5>🎯 Azioni Amministrative</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="d-grid">
                        <Button 
                          variant={seasonInitialized ? "success" : "primary"}
                          disabled={seasonInitialized || loading}
                          onClick={handleInitializeSeason}
                        >
                          {seasonInitialized ? "✅ Campionato Inizializzato" : "🏆 Inizializza Campionato (35 giornate)"}
                        </Button>
                        <small className="text-muted mt-1">
                          {seasonInitialized 
                            ? "Tutte le giornate sono state create con successo" 
                            : "Crea tutte le 35 giornate dalla 3ª alla 38ª di Serie A"
                          }
                        </small>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-grid">
                        <Button 
                          variant="warning"
                          disabled={loading}
                          onClick={handleResetSeason}
                        >
                          🔄 Reset Stagione
                        </Button>
                        <small className="text-muted mt-1">
                          Cancella tutte le giornate e partite per ricominciare
                        </small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <div className="mb-3">
                <h6>Squadre disponibili: {availableTeams.length}/8</h6>
                <small className="text-muted">
                  Squadre non ancora assegnate: {availableTeams.map(team => team.name).join(', ') || 'Nessuna'}
                </small>
              </div>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Squadra Assegnata</th>
                    <th>Stato</th>
                    <th>Registrato il</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                        {user.isAdmin && (
                          <small className="ms-2 badge bg-warning">Admin</small>
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.team ? (
                          <span className="badge bg-success">{user.team.name}</span>
                        ) : (
                          <span className="badge bg-secondary">Nessuna</span>
                        )}
                      </td>
                      <td>
                        {user.isApproved ? (
                          <span className="badge bg-success">✓ Approvato</span>
                        ) : (
                          <span className="badge bg-warning">⏳ In attesa</span>
                        )}
                      </td>
                      <td>
                        <small>{new Date(user.createdAt || '').toLocaleDateString('it-IT')}</small>
                      </td>
                      <td>
                        {!user.isAdmin && (
                          <div className="d-flex gap-2 flex-wrap">
                            {!user.team ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAssignTeam(user)}
                                disabled={availableTeams.length === 0}
                              >
                                Assegna Squadra
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleRemoveTeam(user)}
                              >
                                Rimuovi Squadra
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteUser(user)}
                              title="Elimina utente e libera squadra"
                            >
                              🗑️ Elimina
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {users.filter(u => !u.isAdmin).length === 0 && (
                <Alert variant="info">
                  Nessun utente registrato ancora.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal per assegnare squadra */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assegna Squadra a {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Seleziona una squadra:</Form.Label>
            <Form.Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">-- Scegli una squadra --</option>
              {availableTeams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={confirmAssignTeam}
            disabled={!selectedTeam}
          >
            Assegna Squadra
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;

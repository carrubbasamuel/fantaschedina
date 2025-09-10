import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Form, Modal, Spinner, Table } from 'react-bootstrap';
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
      fetchData();
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
      fetchData();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nella rimozione della squadra');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'utente ${user.username}? Questa azione è irreversibile e libererà automaticamente la sua squadra.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(user.id);
      fetchData();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nell\'eliminazione dell\'utente');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await adminAPI.approveUser(userId);
      fetchData();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nell\'approvazione dell\'utente');
    }
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" role="status" />
        <p className="mt-3 text-secondary">Caricamento...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 fade-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-primary mb-1">Pannello Amministratore</h2>
        <p className="text-secondary mb-0">Gestisci gli utenti e configura il sistema</p>
      </div>
      
      {error && <Alert variant="danger" className="rounded-lg">{error}</Alert>}
      
      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Gestione Stagione */}
        <Card className="slide-up">
          <Card.Header>
            <h5 className="mb-0">Gestione Stagione</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-grid gap-2">
              <Button 
                variant={seasonInitialized ? "success" : "primary"}
                disabled={seasonInitialized || loading}
                onClick={handleInitializeSeason}
                className="mb-2"
              >
                {seasonInitialized ? "Campionato Inizializzato" : "Inizializza Campionato"}
              </Button>
              <small className="text-muted mb-3">
                {seasonInitialized 
                  ? "Tutte le 35 giornate sono state create" 
                  : "Crea tutte le 35 giornate dalla 3ª alla 38ª di Serie A 2025/26"
                }
              </small>
              
              <Button 
                variant="warning"
                disabled={loading}
                onClick={handleResetSeason}
              >
                Reset Stagione
              </Button>
              <small className="text-muted">
                Cancella tutte le giornate e partite per ricominciare
              </small>
            </div>
          </Card.Body>
        </Card>

        {/* Statistiche */}
        <Card className="slide-up">
          <Card.Header>
            <h5 className="mb-0">Statistiche Sistema</h5>
          </Card.Header>
          <Card.Body>
            <div className="row text-center">
              <div className="col-6">
                <div className="h4 text-primary mb-1">{users.length}</div>
                <small className="text-muted">Utenti Totali</small>
              </div>
              <div className="col-6">
                <div className="h4 text-success mb-1">{availableTeams.length}/8</div>
                <small className="text-muted">Squadre Libere</small>
              </div>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Squadre disponibili: {availableTeams.map(team => team.name).join(', ') || 'Nessuna'}
              </small>
            </div>
          </Card.Body>
        </Card>

      </div>

      {/* Tabella Utenti */}
      <Card className="slide-up">
        <Card.Header>
          <h5 className="mb-0">Gestione Utenti</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Squadra</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-bold">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.team ? (
                        <div className="d-flex align-items-center">
                          <Badge bg="primary" className="me-2">
                            {user.team.name}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted">Nessuna squadra</span>
                      )}
                    </td>
                    <td>
                      {user.isApproved ? (
                        <Badge bg="success">Approvato</Badge>
                      ) : (
                        <Badge bg="warning">In Attesa</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {!user.isApproved && (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            Approva
                          </Button>
                        )}
                        
                        {user.team ? (
                          <Button 
                            size="sm" 
                            variant="outline-warning"
                            onClick={() => handleRemoveTeam(user)}
                          >
                            Rimuovi Squadra
                          </Button>
                        ) : (
                          availableTeams.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleAssignTeam(user)}
                            >
                              Assegna Squadra
                            </Button>
                          )
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal per assegnare squadra */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
              <option value="">Seleziona una squadra...</option>
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

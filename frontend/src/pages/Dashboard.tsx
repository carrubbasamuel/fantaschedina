import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Container, Spinner } from 'react-bootstrap';
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
        
        if (user?.isApproved) {
          const gamedayData = await gamedaysAPI.getActive();
          setActiveGameday(gamedayData);

          try {
            const bet = await betsAPI.getByGameday(gamedayData.gameday._id);
            setUserBet(bet);
          } catch (betError) {
            // Nessuna schedina trovata, ok
          }
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Errore nel caricamento dei dati');
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
        <h2 className="text-primary mb-1">Benvenuto, {user?.username}!</h2>
        <p className="text-secondary mb-0">Gestisci le tue schedine e controlla i risultati</p>
      </div>
      
      {error && <Alert variant="danger" className="rounded-lg">{error}</Alert>}
      
      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Sezione squadra assegnata */}
        <Card className="slide-up">
          <Card.Header>
            <h5 className="mb-0">La tua squadra</h5>
          </Card.Header>
          <Card.Body className="text-center">
            {user?.team ? (
              <div>
                <div className="team-logo mb-3">
                  {user.team.name.charAt(0)}
                </div>
                <h4 className="text-primary">{user.team.name}</h4>
                <div className="row text-center mt-3">
                  <div className="col-4">
                    <div className="h5 text-success mb-1">{user.team.wins}</div>
                    <small className="text-muted">Vittorie</small>
                  </div>
                  <div className="col-4">
                    <div className="h5 text-warning mb-1">{user.team.draws}</div>
                    <small className="text-muted">Pareggi</small>
                  </div>
                  <div className="col-4">
                    <div className="h5 text-danger mb-1">{user.team.losses}</div>
                    <small className="text-muted">Sconfitte</small>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge bg="primary" className="fs-6 px-3 py-2">
                    {user.team.points} punti
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="team-logo mb-3 bg-light">
                  ?
                </div>
                <p className="text-muted">Nessuna squadra assegnata</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Stato Account */}
        <Card className="slide-up">
          <Card.Header>
            <h5 className="mb-0">Stato Account</h5>
          </Card.Header>
          <Card.Body className="text-center">
            {user?.isApproved ? (
              <div>
                <div className="mb-3">
                  <span className="status-dot status-active"></span>
                  <strong className="text-success">Account Approvato</strong>
                </div>
                <p className="text-muted">Puoi partecipare alle schedine</p>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <span className="status-dot status-inactive"></span>
                  <strong className="text-warning">In Attesa di Approvazione</strong>
                </div>
                <p className="text-muted">Il tuo account è in attesa di approvazione da parte dell'amministratore</p>
              </div>
            )}
          </Card.Body>
        </Card>

      </div>

      {/* Sezione Giornata Attiva */}
      {user?.isApproved && activeGameday && (
        <Card className="gameday-card active slide-up">
          <Card.Header>
            <h5 className="mb-0">Giornata Attiva</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="mb-1">{activeGameday.gameday.name}</h4>
                <Badge bg="success">Giornata {activeGameday.gameday.number}</Badge>
              </div>
              <div className="text-end">
                {activeGameday.gameday.bettingClosed ? (
                  <Badge bg="danger">Scommesse Chiuse</Badge>
                ) : (
                  <Badge bg="success">Scommesse Aperte</Badge>
                )}
              </div>
            </div>

            {/* Partite */}
            <div className="mb-4">
              <h6 className="text-secondary mb-3">Partite di questa giornata:</h6>
              {activeGameday.matches.map((match) => (
                <div key={match._id} className="match-card">
                  <div className="match-teams">
                    <span className="team-name">{match.homeTeam.name}</span>
                    <span className="vs-separator">vs</span>
                    <span className="team-name">{match.awayTeam.name}</span>
                  </div>
                  {match.result && (
                    <Badge bg="primary">
                      Risultato: {match.result}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Stato Schedina */}
            {userBet ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-success mb-0">Hai già scommesso</h6>
                  {userBet.isEvaluated && (
                    <Badge bg="info" className="fs-6">
                      Punteggio: {userBet.score}/{userBet.predictions.length}
                    </Badge>
                  )}
                </div>
                
                <div className="row">
                  {userBet.predictions.map((prediction, index) => (
                    <div key={index} className="col-6 col-md-3 mb-2">
                      <div className="text-center p-2 bg-light rounded">
                        <small className="text-muted d-block">Partita {index + 1}</small>
                        <strong className="text-primary">{prediction.prediction}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3">
                  <Link to="/my-bets" className="btn btn-outline-primary">
                    Vedi Dettagli
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {!activeGameday.gameday.bettingClosed ? (
                  <div>
                    <p className="text-muted mb-3">Non hai ancora fatto la tua schedina per questa giornata</p>
                    <Link to="/bet" className="btn btn-primary btn-lg">
                      Fai la tua Schedina
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted">Le scommesse per questa giornata sono chiuse</p>
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Azioni Rapide */}
      {user?.isApproved && (
        <Card className="slide-up">
          <Card.Header>
            <h5 className="mb-0">Azioni Rapide</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-grid gap-2">
              <Link to="/schedule" className="btn btn-outline-primary">
                Visualizza Calendario
              </Link>
              <Link to="/leaderboard" className="btn btn-outline-success">
                Classifica Generale
              </Link>
              <Link to="/my-bets" className="btn btn-outline-info">
                Le Mie Schedine
              </Link>
            </div>
          </Card.Body>
        </Card>
      )}

    </Container>
  );
};

export default Dashboard;

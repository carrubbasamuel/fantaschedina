import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { gamedaysAPI, betsAPI } from '../services/api';
import { GamedayWithMatches, Prediction } from '../types';

const NewBet: React.FC = () => {
  const [gameday, setGameday] = useState<GamedayWithMatches | null>(null);
  const [predictions, setPredictions] = useState<{ [matchId: string]: '1' | 'X' | '2' }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveGameday = async () => {
      try {
        setLoading(true);
        const data = await gamedaysAPI.getActive();
        setGameday(data);
        
        // Controlla se l'utente ha già scommesso
        try {
          await betsAPI.getByGameday(data.gameday._id);
          setError('Hai già giocato la schedina per questa giornata!');
        } catch {
          // L'utente non ha ancora scommesso, tutto ok
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Errore nel caricamento della giornata');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveGameday();
  }, []);

  const handlePredictionChange = (matchId: string, prediction: '1' | 'X' | '2') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: prediction
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameday) return;

    // Controlla che tutte le partite abbiano una predizione
    const allMatches = gameday.matches;
    const missingPredictions = allMatches.filter(match => !predictions[match._id]);
    
    if (missingPredictions.length > 0) {
      setError('Devi fare una predizione per tutte le partite!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const predictionsArray: Prediction[] = allMatches.map(match => ({
        match: match._id,
        prediction: predictions[match._id]
      }));

      await betsAPI.create(gameday.gameday._id, predictionsArray);
      setSuccess('Schedina salvata con successo!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore nel salvataggio della schedina');
    } finally {
      setSubmitting(false);
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

  if (!gameday) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Non ci sono giornate attive al momento.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>Nuova Schedina - {gameday.gameday.name}</h4>
              <small className="text-muted">Giornata {gameday.gameday.number}</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <p className="mb-4">
                  Seleziona il risultato per ogni partita: <strong>1</strong> (vittoria casa), 
                  <strong>X</strong> (pareggio), <strong>2</strong> (vittoria trasferta)
                </p>
                
                {gameday.matches.map((match) => (
                  <Card key={match._id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                          Partita {match.matchNumber}: {match.homeTeam.name} vs {match.awayTeam.name}
                        </h6>
                      </div>
                      
                      <div className="d-flex justify-content-center">
                        <div className="btn-group" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name={`match-${match._id}`}
                            id={`match-${match._id}-1`}
                            onChange={() => handlePredictionChange(match._id, '1')}
                            checked={predictions[match._id] === '1'}
                          />
                          <label className="btn btn-outline-success" htmlFor={`match-${match._id}-1`}>
                            1 ({match.homeTeam.name})
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`match-${match._id}`}
                            id={`match-${match._id}-X`}
                            onChange={() => handlePredictionChange(match._id, 'X')}
                            checked={predictions[match._id] === 'X'}
                          />
                          <label className="btn btn-outline-warning" htmlFor={`match-${match._id}-X`}>
                            X (Pareggio)
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`match-${match._id}`}
                            id={`match-${match._id}-2`}
                            onChange={() => handlePredictionChange(match._id, '2')}
                            checked={predictions[match._id] === '2'}
                          />
                          <label className="btn btn-outline-primary" htmlFor={`match-${match._id}-2`}>
                            2 ({match.awayTeam.name})
                          </label>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                
                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="success"
                    type="submit"
                    size="lg"
                    disabled={submitting || Object.keys(predictions).length !== gameday.matches.length}
                  >
                    {submitting ? 'Salvataggio in corso...' : 'Salva Schedina'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={submitting}
                  >
                    Annulla
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewBet;

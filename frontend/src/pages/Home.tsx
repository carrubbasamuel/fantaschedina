import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="text-center mb-5">
            <h1 className="display-4">⚽ Fantaschedine</h1>
            <p className="lead">
              Il gioco delle schedine per il tuo fantacalcio!
            </p>
          </div>
          
          <Row>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h5>🎯 Come funziona</h5>
                  <ul>
                    <li>8 squadre del fantacalcio si sfidano ogni giornata</li>
                    <li>4 partite per giornata</li>
                    <li>Pronostica 1, X o 2 per ogni partita</li>
                    <li>Guadagna punti indovinando i risultati</li>
                    <li>Vince chi totalizza più punti!</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h5>🏆 Le squadre</h5>
                  <div className="small">
                    <div className="row">
                      <div className="col-6">
                        • Scarsenal<br/>
                        • FC LO SQUALO<br/>
                        • FC Tremili<br/>
                        • dark shark
                      </div>
                      <div className="col-6">
                        • fc juventus<br/>
                        • fresco26<br/>
                        • ludopatikos<br/>
                        • siramilan
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="text-center mt-5">
            {user ? (
              <div>
                <h4>Benvenuto, {user.username}!</h4>
                <Link to="/dashboard">
                  <Button variant="primary" size="lg">
                    Vai alla Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <h4>Inizia a giocare!</h4>
                <div className="d-gap gap-3 mt-3">
                  <Link to="/register" className="me-3">
                    <Button variant="success" size="lg">
                      Registrati
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline-primary" size="lg">
                      Accedi
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

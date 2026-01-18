import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {
  ColorSwatch,
  StatCard,
  GlassCard,
  GradientCard,
  LiveBadge,
  ListGroup,
  WeekNavigator,
} from '../components/design-system';
import '../styles/design-system.css';

/**
 * DesignSystemPage - Showcase page for all Midnight Momentum design system components
 */
const DesignSystemPage: React.FC = () => {
  return (
    <div className='design-system-page'>
      <Container fluid='lg' className='py-5'>
        {/* Header */}
        <header className='mb-5 pb-4 border-bottom'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h1 className='display-5 fw-bold'>
                Design System <span className='text-muted fs-4 fw-normal'>// v2.0</span>
              </h1>
              <p className='text-muted lead mb-0'>
                Theme: "Midnight Momentum" - Reusable React Components
              </p>
            </div>
            <LiveBadge />
          </div>
        </header>

        {/* 1. Color Palette */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>01. Color Palette (ColorSwatch)</h2>
          <Row className='g-4'>
            <Col xs={6} md={2}>
              <ColorSwatch color='#0f172a' name='Background' hex='#0f172a' />
            </Col>
            <Col xs={6} md={2}>
              <ColorSwatch color='#1e293b' name='Surface' hex='#1e293b' />
            </Col>
            <Col xs={6} md={2}>
              <ColorSwatch color='#6366f1' name='Primary' hex='#6366f1' />
            </Col>
            <Col xs={6} md={2}>
              <ColorSwatch color='#10b981' name='Success' hex='#10b981' />
            </Col>
            <Col xs={6} md={2}>
              <ColorSwatch color='#f59e0b' name='Warning' hex='#f59e0b' />
            </Col>
            <Col xs={6} md={2}>
              <ColorSwatch color='#ef4444' name='Danger' hex='#ef4444' />
            </Col>
          </Row>

          <div className='mt-4'>
            <Card>
              <Card.Header>Usage Example</Card.Header>
              <Card.Body>
                <pre className='bg-dark p-3 rounded text-warning mb-0'>
                  <code>
                    {`import { ColorSwatch } from '../components/design-system';

<ColorSwatch
  color="#6366f1"
  name="Primary"
  hex="#6366f1"
/>`}
                  </code>
                </pre>
              </Card.Body>
            </Card>
          </div>
        </section>

        <hr className='divider' />

        {/* 2. StatCard Component */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>02. StatCard Component</h2>
          <Row className='g-4'>
            <Col md={6}>
              <StatCard
                title='Performance Stats'
                stats={[
                  { value: '89%', label: 'Completion Rate' },
                  { value: '2.4K', label: 'Total Workouts' },
                ]}
                progress={{ label: 'Monthly Goal', value: 78 }}
              />
            </Col>
            <Col md={6}>
              <StatCard
                title='Revenue Metrics'
                stats={[
                  { value: '$12.5K', label: 'Total Revenue' },
                  { value: '+24%', label: 'Growth' },
                ]}
              />
            </Col>
          </Row>

          <div className='mt-4'>
            <Card>
              <Card.Header>Usage Example</Card.Header>
              <Card.Body>
                <pre className='bg-dark p-3 rounded text-warning mb-0'>
                  <code>
                    {`import { StatCard } from '../components/design-system';

<StatCard
  title="Performance Stats"
  stats={[
    { value: '89%', label: 'Completion Rate' },
    { value: '2.4K', label: 'Total Workouts' }
  ]}
  progress={{ label: 'Monthly Goal', value: 78 }}
/>`}
                  </code>
                </pre>
              </Card.Body>
            </Card>
          </div>
        </section>

        <hr className='divider' />

        {/* 3. Card Variants */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>03. Card Variants</h2>
          <Row className='g-4'>
            <Col md={4}>
              <Card className='h-100'>
                <Card.Body>
                  <Card.Title>Standard Card</Card.Title>
                  <Card.Text className='text-muted'>
                    This is the default Bootstrap card with Midnight Momentum styling applied.
                  </Card.Text>
                  <Button variant='outline-light' size='sm'>
                    Learn More
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <GlassCard title='Glass Panel' className='h-100'>
                <Card.Text className='text-muted'>
                  GlassCard component with glassmorphism effect for floating elements.
                </Card.Text>
                <Button variant='outline-light' size='sm'>
                  Learn More
                </Button>
              </GlassCard>
            </Col>

            <Col md={4}>
              <GradientCard title='Gradient Border' className='h-100'>
                <Card.Text className='text-muted'>
                  GradientCard with animated gradient border effect for premium content.
                </Card.Text>
                <Button variant='primary' size='sm'>
                  Learn More
                </Button>
              </GradientCard>
            </Col>
          </Row>

          <div className='mt-4'>
            <Card>
              <Card.Header>Usage Examples</Card.Header>
              <Card.Body>
                <pre className='bg-dark p-3 rounded text-warning mb-0'>
                  <code>
                    {`import { GlassCard, GradientCard } from '../components/design-system';

// Glass Card
<GlassCard title="Glass Panel">
  <p>Content goes here</p>
</GlassCard>

// Gradient Card
<GradientCard title="Gradient Border">
  <p>Premium content</p>
</GradientCard>`}
                  </code>
                </pre>
              </Card.Body>
            </Card>
          </div>
        </section>

        <hr className='divider' />

        {/* 4. LiveBadge Component */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>04. LiveBadge Component</h2>
          <Row className='g-4'>
            <Col md={6}>
              <Card>
                <Card.Header className='d-flex justify-content-between align-items-center'>
                  <span>Status Indicators</span>
                  <LiveBadge />
                </Card.Header>
                <Card.Body>
                  <div className='d-flex gap-3 align-items-center'>
                    <LiveBadge text='LIVE' />
                    <LiveBadge text='ACTIVE' />
                    <LiveBadge text='ONLINE' />
                  </div>
                  <p className='text-muted mt-3 mb-0'>
                    Use LiveBadge to indicate real-time status with a pulsing animation.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <Card.Header>Usage Example</Card.Header>
                <Card.Body>
                  <pre className='bg-dark p-3 rounded text-warning mb-0'>
                    <code>
                      {`import { LiveBadge } from '../components/design-system';

<LiveBadge />
<LiveBadge text="ACTIVE" />
<LiveBadge text="ONLINE" />`}
                    </code>
                  </pre>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        <hr className='divider' />

        {/* 7. Typography Examples */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>07. Typography</h2>
          <Row className='g-4'>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <p className='text-muted small mb-3'>Font Family: Inter (UI Text)</p>
                  <h1 className='mb-3'>Heading 1 - Dashboard</h1>
                  <h2 className='mb-3'>Heading 2 - Section</h2>
                  <h3 className='mb-3'>Heading 3 - Card Title</h3>
                  <p className='lead mb-3'>Lead text for introductions</p>
                  <p className='mb-2'>Body text for main content</p>
                  <p className='text-muted small mb-0'>Small muted for metadata</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <p className='text-muted small mb-3'>
                    Font Family: JetBrains Mono (Data/Numbers)
                  </p>
                  <div className='mb-4'>
                    <div className='stat-number'>12,500</div>
                    <p className='text-muted small mb-0'>Use .stat-number class</p>
                  </div>
                  <h2 className='font-data text-success mb-2'>
                    +15.4% <span className='fs-6 text-muted'>↑ change</span>
                  </h2>
                  <h2 className='font-data text-primary mb-2'>
                    00:45:12 <span className='fs-6 text-muted'>time</span>
                  </h2>
                  <code className='d-block p-2 bg-dark rounded text-warning'>
                    Use .font-data class for monospace
                  </code>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        <hr className='divider' />

        {/* 8. Getting Started */}
        <section className='mb-5'>
          <h2 className='h4 mb-4 text-primary font-data'>08. Getting Started</h2>
          <Card>
            <Card.Header>How to Use</Card.Header>
            <Card.Body>
              <h5>1. Import the design system CSS</h5>
              <pre className='bg-dark p-3 rounded text-warning mb-3'>
                <code>{`import '../styles/design-system.css';`}</code>
              </pre>

              <h5>2. Import components you need</h5>
              <pre className='bg-dark p-3 rounded text-warning mb-3'>
                <code>
                  {`import {
  ColorSwatch,
  StatCard,
  GlassCard,
  GradientCard,
  LiveBadge,
  ListGroup,
  WeekNavigator
} from '../components/design-system';`}
                </code>
              </pre>

              <h5>3. Add Google Fonts to your HTML (if not already added)</h5>
              <pre className='bg-dark p-3 rounded text-warning mb-3'>
                <code>
                  {`<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`}
                </code>
              </pre>

              <h5>CSS Variables Available</h5>
              <div className='row g-2'>
                <div className='col-md-6'>
                  <ul className='list-unstyled font-data small text-muted'>
                    <li>
                      <code className='text-warning'>--bg-deep</code> - Main background
                    </li>
                    <li>
                      <code className='text-warning'>--bg-surface</code> - Card background
                    </li>
                    <li>
                      <code className='text-warning'>--primary</code> - Primary color
                    </li>
                    <li>
                      <code className='text-warning'>--accent-success</code> - Success color
                    </li>
                  </ul>
                </div>
                <div className='col-md-6'>
                  <ul className='list-unstyled font-data small text-muted'>
                    <li>
                      <code className='text-warning'>--accent-warning</code> - Warning color
                    </li>
                    <li>
                      <code className='text-warning'>--accent-danger</code> - Danger color
                    </li>
                    <li>
                      <code className='text-warning'>--text-main</code> - Main text color
                    </li>
                    <li>
                      <code className='text-warning'>--border-color</code> - Border color
                    </li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>

        {/* Footer */}
        <footer className='mt-5 pt-5 border-top text-center text-muted'>
          <p className='mb-2'>Midnight Momentum Design System v2.0</p>
          <p className='small'>Built with React, TypeScript, Bootstrap 5 & Inter/JetBrains Mono</p>
          <p className='small font-data'>© 2025 - All components are reusable and customizable</p>
        </footer>
      </Container>
    </div>
  );
};

export default DesignSystemPage;

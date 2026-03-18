import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from './Layout';

describe('Layout Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render navigation with logo', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Product Tracker')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
  });

  it('should show Login button when not authenticated', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should show Dashboard and Logout when authenticated', () => {
    localStorage.setItem('token', 'fake-token');

    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText(/© 2026 Product Tracker/)).toBeInTheDocument();
  });
});

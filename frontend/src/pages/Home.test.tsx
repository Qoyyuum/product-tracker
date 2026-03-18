import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home Page', () => {
  it('should render hero section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Verify Product Authenticity with Blockchain/)).toBeInTheDocument();
    expect(screen.getByText(/Scan QR codes to instantly verify/)).toBeInTheDocument();
  });

  it('should render search box', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Enter QR hash or product ID/)).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  it('should navigate to product page on search', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/Enter QR hash or product ID/);
    const button = screen.getByText('Verify');

    fireEvent.change(input, { target: { value: 'test-hash-123' } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/product/test-hash-123');
  });

  it('should render feature cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Cryptographic Verification')).toBeInTheDocument();
    expect(screen.getByText('Complete Transparency')).toBeInTheDocument();
    expect(screen.getByText('Global Edge Network')).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Scan Product')).toBeInTheDocument();
    expect(screen.getByText('Register as Manufacturer')).toBeInTheDocument();
  });
});

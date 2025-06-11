import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Flex } from '../ui';
import UserProfile, { LoginButton } from '../auth/UserProfile';
import { useAuth } from '../../contexts/AuthContext';

const Nav = styled.nav`
  background-color: ${props => props.theme.colors.white};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: ${props =>
    props.active ? props.theme.colors.primary : props.theme.colors.gray[600]};
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.gray[50]};
  }

  ${props =>
    props.active &&
    `
    background-color: ${props.theme.colors.primary}20;
    color: ${props.theme.colors.primary};
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: ${props.theme.colors.primary};
    }
  `}
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${props => props.theme.colors.gray[600]};
`;

/**
 * Navigation component
 * Main navigation bar for the dental ERP system
 */
const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pacientes', label: 'Pacientes', icon: '👥' },
    { path: '/citas', label: 'Citas', icon: '📅' },
    { path: '/tratamientos', label: 'Tratamientos', icon: '🦷' },
    { path: '/busqueda', label: 'Búsqueda', icon: '🔍' },
    { path: '/performance-ux', label: 'Rendimiento & UX', icon: '⚡' },
  ];

  const isActivePath = path => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Nav>
      <Container maxWidth="xl">
        <Flex
          justify="space-between"
          align="center"
          style={{ minHeight: '4rem' }}
        >
          {/* Logo */}
          <Logo>
            <span>🦷</span>
            <span>DentalERP</span>
          </Logo>

          {/* Main Navigation */}
          <Flex align="center" gap={2}>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                active={isActivePath(item.path)}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </Flex>

          {/* User Menu */}
          <div>
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <UserProfile />
            ) : (
              <LoginButton />
            )}
          </div>
        </Flex>
      </Container>
    </Nav>
  );
};

export default Navigation;

// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../services/auth/AuthContext';

export const useAuth = () => useContext(AuthContext);
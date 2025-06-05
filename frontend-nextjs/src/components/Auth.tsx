'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '../lib/queries';
import type { AuthPayload } from '../types';
import { RoleEnum } from '../types';
import { Button, Input, Card, CardHeader, CardContent } from './ui';
import { CONTAINER, FLEX, TEXT, SPACING, cn } from '../lib/styles';

interface AuthProps {
  onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleEnum>(RoleEnum.STAFF);

  const [login, { loading: loginLoading, error: loginError }] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [signup, { loading: signupLoading, error: signupError }] = useMutation<{ signup: AuthPayload }>(SIGNUP_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const result = await login({ variables: { email, password } });
        if (result.data?.login.token) {
          localStorage.setItem('token', result.data.login.token);
          onLogin(result.data.login.token);
        }
      } else {
        const result = await signup({ variables: { email, password, name, role } });
        if (result.data?.signup.token) {
          localStorage.setItem('token', result.data.signup.token);
          onLogin(result.data.signup.token);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    try {
      const result = await login({ variables: { email: userEmail, password: userPassword } });
      if (result.data?.login.token) {
        localStorage.setItem('token', result.data.login.token);
        onLogin(result.data.login.token);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isLoading = loginLoading || signupLoading;
  const error = loginError || signupError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={cn(TEXT.heading1, 'mt-6 text-center')}>
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent>
            {/* Quick login buttons */}
            <div className={SPACING.section}>
              <h4 className={cn(TEXT.heading3, SPACING.content, 'text-center')}>Login rápido:</h4>
              <div className={cn(FLEX.wrap, 'justify-center')}>
                <Button 
                  variant="info"
                  size="sm"
                  onClick={() => quickLogin('admin@food360.local', '123456')}
                  aria-label="Login rápido como administrador"
                >
                  Admin
                </Button>
                <Button 
                  variant="info"
                  size="sm"
                  onClick={() => quickLogin('manager@food360.local', 'manager')}
                  aria-label="Login rápido como manager"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  Manager
                </Button>
                <Button 
                  variant="success"
                  size="sm"
                  onClick={() => quickLogin('staff@food360.local', 'staff')}
                  aria-label="Login rápido como staff"
                >
                  Staff
                </Button>
              </div>
            </div>

            <hr className={SPACING.section} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <>
                  <Input
                    type="text"
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  
                  <Input
                    type="select"
                    label="Rol"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleEnum)}
                    options={[
                      { value: RoleEnum.STAFF, label: 'Staff' },
                      { value: RoleEnum.MANAGER, label: 'Manager' },
                      { value: RoleEnum.SUPERADMIN, label: 'Super Admin' }
                    ]}
                  />
                </>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className={TEXT.error}>
                  <strong>Error:</strong> {error.message}
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <span className={TEXT.small}>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </span>
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
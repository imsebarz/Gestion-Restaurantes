'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '../lib/queries';
import type { AuthPayload } from '../types';
import { RoleEnum } from '../types';

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Quick login buttons */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Login rápido:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => quickLogin('admin@food360.local', '123456')} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                aria-label="Login rápido como administrador"
              >
                Admin
              </button>
              <button 
                onClick={() => quickLogin('manager@food360.local', 'manager')} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm"
                aria-label="Login rápido como manager"
              >
                Manager
              </button>
              <button 
                onClick={() => quickLogin('staff@food360.local', 'staff')} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                aria-label="Login rápido como staff"
              >
                Staff
              </button>
            </div>
          </div>

          <hr className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleEnum)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value={RoleEnum.STAFF}>Staff</option>
                      <option value={RoleEnum.MANAGER}>Manager</option>
                      <option value={RoleEnum.SUPERADMIN}>Super Admin</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loginLoading || signupLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loginLoading || signupLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </div>
          </form>

          {(loginError || signupError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {loginError?.message || signupError?.message}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
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
        </div>
      </div>
    </div>
  );
};

export default Auth;
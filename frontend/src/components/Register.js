import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const { name, email, password } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      login(res.data.token); // Guardar token y actualizar contexto
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (err) {
      setError(err.response?.data?.msg || 'Error en el registro');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Registro de Usuario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Nombre"
        name="name"
        value={name}
        onChange={onChange}
        required
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        name="password"
        value={password}
        onChange={onChange}
        required
        minLength={6}
      />
      <button type="submit">Registrarse</button>
      <p>
  ¿Ya tienes una cuenta? <a href="/index">Ingresa aquí</a>
</p>

    </form>
    
  );
};

export default Register;
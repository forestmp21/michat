// Cambia esta URL si tu backend tiene otro dominio en Render
const servidor = 'https://mi-chat-yq5u.onrender.com';

// 🔐 REGISTRO
function registrarse() {
  const usuario = document.getElementById('regUsuario').value;
  const contraseña = document.getElementById('regClave').value;

  if (!usuario || !contraseña) {
    return alert('Llena todos los campos');
  }

  fetch(`${servidor}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contraseña })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
    })
    .catch(err => {
      console.error('Error en el registro:', err);
      alert('Ocurrió un error al registrarse');
    });
}

// 🔑 LOGIN
function iniciarSesion() {
  const usuario = document.getElementById('loginUsuario').value;
  const contraseña = document.getElementById('loginClave').value;

  if (!usuario || !contraseña) {
    return alert('Completa ambos campos');
  }

  fetch(`${servidor}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contraseña })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', usuario);
        window.location.href = 'chat.html';
      } else {
        alert(data.mensaje || 'Error al iniciar sesión');
      }
    })
    .catch(err => {
      console.error('Error en el login:', err);
      alert('Error al iniciar sesión');
    });
}

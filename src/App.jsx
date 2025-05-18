import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


const App = () => {
  const [nombreCancion, setNombreCancion] = useState('');
  const [url, setUrl] = useState('');
  const [items, setItems] = useState([]);
  const [esValido, setEsValido] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [ordenarPorReproducciones, setOrdenarPorReproducciones] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('myItems')) || [];
    setItems(storedItems);
  }, []);

  useEffect(() => {
    //Condicion para que guarde info desde que se ingresa el primer item
    if (items.length > 0) {
      localStorage.setItem('myItems', JSON.stringify(items));
    }
  }, [items]);

const handlePlay = (item) => {
  const nuevosItems = items.map((cancion) =>
    cancion.videoId === item.videoId
      ? { ...cancion, reproducciones: cancion.reproducciones + 1 }
      : cancion
  );
  setItems(nuevosItems);
  setSelectedVideoId(item.videoId);
  setMostrarModal(true); // Mostrar el modal
};

const manejarCambioUrl = (e) => {
  const valor = e.target.value.trim();
  setUrl(valor);

  if (valor === '') {
    setSelectedVideoId('');
    setEsValido(false);
    setErrorMensaje('⚠️ La URL no puede estar vacía.');
    return;
  }

  const idRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = valor.match(idRegex);

  if (match) {
    setSelectedVideoId(match[1]);
    setEsValido(true);
    setErrorMensaje('');
  } else {
    setSelectedVideoId('');
    setEsValido(false);
    setErrorMensaje('❌ La URL ingresada no es válida. Asegúrate de que sea un enlace correcto de YouTube.');
  }
};

  const handleSave = () => {
    setErrorMensaje('');
  
    const nombre = nombreCancion.trim();
    const urlLimpiada = url.trim();
  
    if (nombre === '') {
      setErrorMensaje('⚠️ El campo del nombre de la canción es obligatorio.');
      return;
    }
  
  if (urlLimpiada === '' || !esValido || selectedVideoId === '') {
  setErrorMensaje('⚠️ El campo de la URL es obligatoria.');
  return;
}
  
    const urlYaExiste = items.some(item => item.url === urlLimpiada);
    if (urlYaExiste) {
      setErrorMensaje('⚠️ Esta canción ya fue agregada.');
      return;
    }
  
    const nuevoItem = {
      nombre,
      url: urlLimpiada,
      videoId: selectedVideoId,
      reproducciones: 0,
    };
  
    setItems(prevItems => [...prevItems, nuevoItem]);
    setMensajeExito('✅ Canción agregada a la lista');
    setTimeout(() => setMensajeExito(''), 3000); // Desaparece en 3 segundos
  
    // Limpiar campos
    setNombreCancion('');
    setUrl('');
    setSelectedVideoId('');
    setEsValido(true);
    
  };

const handleDelete = (videoIdToDelete) => {
  const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta canción?');
  if (!confirmar) return;

  const updatedItems = items.filter(item => item.videoId !== videoIdToDelete);
  setItems(updatedItems);

  if (selectedVideoId === videoIdToDelete) {
    setSelectedVideoId(null);
  }
};


const Modal = ({ videoId, onClose }) => {
  if (!videoId) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div className="ventana" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`}
          title="Reproductor de YouTube"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '10px',
          }}
        ></iframe>

        <button className="btnCerrar" onClick={onClose}>
          Cerrar
        </button>
         </div>
    </div>
  );
};

  return (          
      <div>
    
      <header>
        <h1>Reproductor de Videos</h1>
      </header>

      <main className="container mt-5">
        <h2 className="lista">LISTA TUS CANCIONES!</h2>

      <input
        type="text"
        value={nombreCancion}
        placeholder="Ingresa nombre de la canción..."
        onChange={(e) => setNombreCancion(e.target.value)}
      />
      <br />

      <input
        type="text"
        value={url}
        placeholder="Ingresa URL de la cancion..."
        onChange={manejarCambioUrl}
      />
      <br />

      <button className="btnGuardar" onClick={handleSave}>Guardar</button>

      {errorMensaje && <p className="mensaje-erroneo">{errorMensaje}</p>}
      {!errorMensaje && esValido && url && <p className="mensaje-valido">✅ Enlace válido</p>}
      {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}


      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
  <label htmlFor="busqueda">🔍 Buscar canción en la lista:</label><br />
  <input
    id="busqueda"
    type="text"
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    placeholder="Escribe el nombre de la cancion que deseas buscar..."
  />
</div>

{items.length === 0 && (
  <p className='listavacia'>🎵 La lista está vacía. Agrega una canción para comenzar.</p>
)}

  <ul>
  {(ordenarPorReproducciones ? [...items].sort((a, b) => b.reproducciones - a.reproducciones) : items)
    .filter(item => item.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .map((item, index) => (
    <li
      key={index}
      className={selectedVideoId === item.videoId ? 'seleccionado' : ''}
      onClick={() => setSelectedVideoId(item.videoId)}
    >
      <strong>{item.nombre}</strong><br />
    {/*<a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>*/}
      <button className="btnPlay"  onClick={() => handlePlay(item)}><i class="fas fa-play"></i>Play</button>
      <span style={{ marginLeft: '10px' }}>Reproducciones: {item.reproducciones}</span>
    </li>
  ))}
</ul>

{items.some(item => item.videoId === selectedVideoId) && (
  <button className="btnBorrar"
    onClick={() => handleDelete(selectedVideoId)}
  >
    🗑️ Borrar
  </button>
)}

{items.length > 0 && (
  <button className="btnOrdenar"
    onClick={() => setOrdenarPorReproducciones(!ordenarPorReproducciones)}
  >
    {ordenarPorReproducciones
      ? 'Orden por ingreso'
      : 'Ordenar por reproducciones'}
  </button>
)}

{mostrarModal && (
  <Modal
    videoId={selectedVideoId}
    onClose={() => setMostrarModal(false)}
  />
)}
  </main>
  </div>
  );
};

export default App


 
const API_URL = 'https://fakestoreapi.com/products?limit=6';
const STORAGE_KEY = 'carrito';
const contenedorProductos = document.getElementById('contenedor-productos');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCompra = document.getElementById('contador-compra');

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function leerCarritoDesdeStorage() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);
        if (!datos) return [];

        const carritoGuardado = JSON.parse(datos);
        if (!Array.isArray(carritoGuardado)) return [];

        return carritoGuardado
            .filter(item => item && typeof item === 'object')
            .map(item => ({
                ...item,
                cantidad: Number.isFinite(Number(item.cantidad)) && Number(item.cantidad) > 0 ? Number(item.cantidad) : 1
            }));
    } catch (error) {
        console.warn('No se pudo leer el carrito:', error);
        return [];
    }
}

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    } catch (error) {
        console.warn('No se pudo guardar el carrito:', error);
    }
}

let carrito = leerCarritoDesdeStorage();
let productos = [];

function renderProductos(lista) {
    productos = Array.isArray(lista) ? lista : [];
    if (!contenedorProductos) return;

    contenedorProductos.innerHTML = productos.map(producto => `
        <div class="tarjeta-producto">
            <img src="${escaparHTML(producto.image)}" class="imagen-producto" alt="${escaparHTML(producto.title)}">
            <div class="cuerpo-producto">
                <h5 class="titulo-producto">${escaparHTML(producto.title)}</h5>
                <p class="categoria-producto">${escaparHTML(producto.category)}</p>
                <p class="precio-producto">$${producto.price}</p>
                <button class="boton-carrito-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            </div>
        </div>
    `).join('');
}

async function cargarProductos() {
    if (!contenedorProductos) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('No se pudo cargar el catálogo');
        const data = await response.json();
        const lista = Array.isArray(data) ? data : data.products || [];
        renderProductos(lista);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = '<p class="text-danger">No se pudieron cargar los productos. Verifica tu conexión.</p>';
    }
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarritoEnStorage();
    renderCarrito();
}

function renderCarrito() {
    if (!listaCarrito || !totalCarrito || !contadorCompra) return;

    contadorCompra.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="text-muted">Tu carrito está vacío.</p>';
        totalCarrito.textContent = '$0';
        return;
    }

    listaCarrito.innerHTML = carrito.map(item => `
        <div class="item-carrito mb-4">
            <div class="info-producto">
                <strong>${escaparHTML(item.title)}</strong><br>
                <small class="precio-unitario">$${item.price}</small>
            </div>
            <div class="controles-cantidad">
                <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, -1)">−</button>
                <input type="number" class="input-cantidad" value="${item.cantidad}" 
                       onchange="cambiarCantidadDirecta(${item.id}, this.value)" min="1">
                <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>
            <div class="subtotal-item">
                <span class="subtotal-valor">$${(item.price * item.cantidad).toFixed(2)}</span>
                <button class="btn btn-sm btn-danger" onclick="quitarDelCarrito(${item.id})">✕</button>
            </div>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        quitarDelCarrito(id);
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarritoEnStorage();
    renderCarrito();
}

function cambiarCantidadDirecta(id, valor) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    const nuevaCantidad = parseInt(valor) || 1;
    
    if (nuevaCantidad < 1) {
        quitarDelCarrito(id);
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarritoEnStorage();
    renderCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarritoEnStorage();
    renderCarrito();
}

function mostrarToast(tipo, mensaje) {
    const toast = document.getElementById('toast-notificacion');
    const toastMensaje = document.getElementById('toast-mensaje');
    const toastIcono = document.getElementById('toast-icono');
    if (!toast) return;

    // Limpiar estado anterior
    clearTimeout(toast._ocultarTimer);
    toast.classList.remove('visible', 'ocultando', 'toast-exito', 'toast-error');

    // Forzar reflow para reiniciar animaciones
    void toast.offsetWidth;

    toastIcono.textContent = tipo === 'exito' ? '✅' : '❌';
    toastMensaje.textContent = mensaje;
    toast.classList.add('visible', tipo === 'exito' ? 'toast-exito' : 'toast-error');

    toast._ocultarTimer = setTimeout(() => {
        toast.classList.add('ocultando');
        setTimeout(() => {
            toast.classList.remove('visible', 'ocultando', 'toast-exito', 'toast-error');
        }, 400);
    }, 5000);
}

function inicializarFormularioContacto() {
    const formulario = document.getElementById('formulario-contacto');
    if (!formulario) return;

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const boton = formulario.querySelector('[data-fs-submit-btn]');
        const textoOriginal = boton ? boton.textContent : null;

        // Estado de carga
        if (boton) {
            boton.disabled = true;
            boton.classList.add('cargando');
            boton.textContent = 'Enviando...';
        }

        try {
            const datos = new FormData(formulario);
            const respuesta = await fetch('https://formspree.io/f/xvzjydkj', {
                method: 'POST',
                body: datos,
                headers: { Accept: 'application/json' }
            });

            if (respuesta.ok) {
                mostrarToast('exito', '¡Mensaje enviado! Nos pondremos en contacto pronto.');
                formulario.reset();
            } else {
                const cuerpo = await respuesta.json().catch(() => ({}));
                const errorMsg = cuerpo?.errors?.map(err => err.message).join(', ')
                    || 'Hubo un problema al enviar. Intentá de nuevo.';
                mostrarToast('error', errorMsg);
            }
        } catch {
            mostrarToast('error', 'Sin conexión. Revisá tu internet e intentá de nuevo.');
        } finally {
            if (boton) {
                boton.disabled = false;
                boton.classList.remove('cargando');
                boton.textContent = textoOriginal;
            }
        }
    });
}

window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.cambiarCantidad = cambiarCantidad;
window.cambiarCantidadDirecta = cambiarCantidadDirecta;

async function init() {
    await cargarProductos();
    renderCarrito();
    inicializarFormularioContacto();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
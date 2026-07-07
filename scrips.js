const API_URL = 'https://fakestoreapi.com/products?limit=6';
const STORAGE_KEY = 'carrito';
const contenedorProductos = document.getElementById('contenedor-productos');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCompra = document.getElementById('contador-compra');

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
            <img src="${producto.image}" class="imagen-producto" alt="${producto.title}">
            <div class="cuerpo-producto">
                <h5 class="titulo-producto">${producto.title}</h5>
                <p class="categoria-producto">${producto.category}</p>
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
                <strong>${item.title}</strong><br>
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

function inicializarFormularioContacto() {
    const formulario = document.getElementById('formulario-contacto');
    const mensajeExito = document.querySelector('[data-fs-success]');
    
    if (!formulario) return;

    const observer = new MutationObserver(() => {
        if (mensajeExito && mensajeExito.style.display !== 'none') {
            mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                mensajeExito.style.display = 'none';
            }, 6000);
        }
    });

    if (mensajeExito) {
        observer.observe(mensajeExito, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
}

async function init() {
    await cargarProductos();
    renderCarrito();
    inicializarFormularioContacto();
}

window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.cambiarCantidad = cambiarCantidad;
window.cambiarCantidadDirecta = cambiarCantidadDirecta;

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
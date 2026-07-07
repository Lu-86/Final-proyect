const API_URL = 'https://fakestoreapi.com/products?limit=6';
const productosContainer = document.getElementById('productosContainer');
const carritoItems = document.getElementById('carritoItems');
const carritoTotal = document.getElementById('carritoTotal');
const cartCount = document.getElementById('cartCount');

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productos = [];

function renderProductos(lista) {
    productos = lista;
    productosContainer.innerHTML = lista.map(producto => `
        <div class="producto-card">
            <img src="${producto.image}" class="producto-imagen" alt="${producto.title}">
            <div class="producto-cuerpo">
                <h5 class="producto-titulo">${producto.title}</h5>
                <p class="producto-categoria">${producto.category}</p>
                <p class="producto-precio">$${producto.price}</p>
                <button class="boton-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            </div>
        </div>
    `).join('');
}

async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('No se pudo cargar el catálogo');
        const data = await response.json();
        const lista = Array.isArray(data) ? data : data.products || [];
        renderProductos(lista);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productosContainer.innerHTML = '<p class="text-danger">No se pudieron cargar los productos. Verifica tu conexión.</p>';
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

    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

function renderCarrito() {
    if (!carritoItems || !carritoTotal || !cartCount) return;

    cartCount.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="text-muted">Tu carrito está vacío.</p>';
        carritoTotal.textContent = '$0';
        return;
    }

    carritoItems.innerHTML = carrito.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <strong>${item.title}</strong><br>
                <small>${item.cantidad} x $${item.price}</small>
            </div>
            <button class="btn btn-sm btn-danger" onclick="quitarDelCarrito(${item.id})">X</button>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

async function init() {
    await cargarProductos();
    renderCarrito();
}

window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.addEventListener('DOMContentLoaded', init);



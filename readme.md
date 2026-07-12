# Hardtaken — Tienda de Ropa Online

Plataforma de e-commerce ficticia moderna y accesible, construida con HTML, CSS y JavaScript vanilla. Consume una API REST externa para mostrar productos reales, incluye un carrito de compras persistente y un formulario de contacto funcional.

---

## Demo

> Abrí `index.html` en tu navegador para ejecutar el proyecto localmente.

---

## Características

- **Consumo de API REST** — Productos cargados dinámicamente desde [FakeStore API](https://fakestoreapi.com) usando `fetch` con `async/await`
- **Carrito de compras** — Agregar, quitar y modificar cantidades, con cálculo de totales en tiempo real
- **Persistencia con `localStorage`** — El carrito se mantiene aunque se recargue la página
- **Protección XSS** — Todos los datos de la API son sanitizados con `escaparHTML()` antes de renderizarse en el DOM
- **Accesibilidad (a11y)** — Atributos ARIA, navegación por teclado y enlace de salto al contenido principal
- **Formulario de contacto funcional** — Integrado con [Formspree](https://formspree.io), con validación y notificaciones tipo Toast personalizadas
- **Diseño responsive** — Compatible con dispositivos móviles, tablets y escritorio

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura y accesibilidad |
| CSS3 / Vanilla CSS | Estilos, animaciones y diseño responsive |
| JavaScript (ES2022) | Lógica, DOM y consumo de API |
| Bootstrap 5.3 | Componentes UI (offcanvas, collapse) |
| FakeStore API | Fuente de datos de productos |
| Formspree | Backend del formulario de contacto |
| localStorage | Persistencia del carrito |

---

## 📁 Estructura del proyecto

```
finalproyect/
├── index.html       # Estructura principal de la página
├── style.css        # Estilos y animaciones
├── scrips.js        # Lógica de la aplicación (API, carrito, formulario, toast)
└── README.md        # Documentación del proyecto
```

---

## Instalación y uso

No requiere instalación ni dependencias locales. Todo corre directamente en el navegador.

```bash
# Clonar el repositorio
git clone https://github.com/Lu-86/Final-proyect.git

# Abrir el proyecto
cd Final-proyect

# Abrir index.html en el navegador
start index.html   # Windows
open index.html    # macOS
```

---

## Seguridad

Los datos provenientes de la API externa son procesados con la función `escaparHTML()` antes de insertarse en el DOM, previniendo ataques de **Cross-Site Scripting (XSS)**:

```js
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
```

---

## Autor

**Hardtaken**  
© 2026 Hardtaken
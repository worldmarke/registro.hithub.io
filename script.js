// script.js

// --- Elementos del DOM ---
const roleSelection = document.getElementById('roleSelection');
const btnVendorRole = document.getElementById('btnVendorRole');
const btnClientRole = document.getElementById('btnClientRole');

const authSection = document.getElementById('authSection');
const authRoleDisplay = document.getElementById('authRoleDisplay');
const authActionDisplay = document.getElementById('authActionDisplay');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const mainAuthBtn = document.getElementById('mainAuthBtn');
const toggleAuthBtn = document.getElementById('toggleAuthBtn');

const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');

const vendorPanel = document.getElementById('vendorPanel');
const vendorEmailDisplay = document.getElementById('vendorEmailDisplay');
const productForm = document.getElementById('productForm');
const productNameInput = document.getElementById('productNameInput');
const productPriceInput = document.getElementById('productPriceInput');
const productNameError = document.getElementById('productNameError');
const productPriceError = document.getElementById('productPriceError');
const vendorProductsList = document.getElementById('vendorProductsList');
const noVendorProductsMessage = document.getElementById('noVendorProductsMessage');
const totalCommissionDisplay = document.getElementById('totalCommissionDisplay');

const clientPanel = document.getElementById('clientPanel');
const clientNameDisplay = document.getElementById('clientNameDisplay');
const availableProductsList = document.getElementById('availableProductsList');
const noAvailableProductsMessage = document.getElementById('noAvailableProductsMessage');
const orderFormContainer = document.getElementById('orderFormContainer');
const orderProductName = document.getElementById('orderProductName');
const orderProductPrice = document.getElementById('orderProductPrice');
const deliveryAddressInput = document.getElementById('deliveryAddressInput');
const deliveryAddressError = document.getElementById('deliveryAddressError');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const clientOrdersList = document.getElementById('clientOrdersList');
const noClientOrdersMessage = document.getElementById('noClientOrdersMessage');

const logoutBtn = document.getElementById('logoutBtn');

// --- Variables de Estado Globales ---
let currentUser = null; // Almacena el usuario actualmente logueado
let currentRole = ''; // 'vendor' o 'client'
let isRegistering = false; // true para registro, false para login
let selectedProductIdForOrder = null; // Para el proceso de pedido del cliente

// --- Funciones de Utilidad para localStorage ---
function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- Validación de Campos ---
function isValidEmail(email) {
    // Valida formato de Gmail (ej. usuario@gmail.com)
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    // Valida un número de 9 dígitos (ej. para Perú)
    const regex = /^\d{9}$/;
    return regex.test(phone);
}

function isValidPassword(password) {
    // Contraseña de al menos 6 caracteres
    return password.length >= 6;
}

function displayError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

// --- Gestión de la Interfaz de Usuario (Mostrar/Ocultar Secciones) ---
function hideAllSections() {
    roleSelection.style.display = 'none';
    authSection.style.display = 'none';
    vendorPanel.style.display = 'none';
    clientPanel.style.display = 'none';
    logoutBtn.style.display = 'none';
}

function showSection(sectionElement) {
    hideAllSections();
    sectionElement.style.display = 'block';
    if (currentUser) {
        logoutBtn.style.display = 'block';
    }
}

function updateAuthFormUI() {
    hideError(emailError);
    hideError(passwordError);
    hideError(nameError);
    hideError(phoneError);

    emailInput.value = '';
    passwordInput.value = '';
    nameInput.value = '';
    phoneInput.value = '';

    authRoleDisplay.textContent = currentRole === 'vendor' ? 'Vendedor' : 'Cliente';
    authActionDisplay.textContent = isRegistering ? 'Registro' : 'Login';
    mainAuthBtn.textContent = isRegistering ? 'Registrarse' : 'Iniciar Sesión';
    toggleAuthBtn.textContent = isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate';

    if (currentRole === 'vendor') {
        nameInput.style.display = 'none';
        phoneInput.style.display = isRegistering ? 'block' : 'none';
    } else { // client
        phoneInput.style.display = 'none';
        nameInput.style.display = isRegistering ? 'block' : 'none';
    }
}

// --- Autenticación ---
function handleAuth(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const name = nameInput.value;
    const phone = phoneInput.value;

    let valid = true;

    // Validar Email
    if (!isValidEmail(email)) {
        displayError(emailError, 'El correo debe ser un email de Gmail válido.');
        valid = false;
    } else {
        hideError(emailError);
    }

    // Validar Contraseña
    if (!isValidPassword(password)) {
        displayError(passwordError, 'La contraseña debe tener al menos 6 caracteres.');
        valid = false;
    } else {
        hideError(passwordError);
    }

    // Validar campos específicos del rol en registro
    if (isRegistering) {
        if (currentRole === 'client') {
            if (!name.trim()) {
                displayError(nameError, 'El nombre no puede estar vacío.');
                valid = false;
            } else {
                hideError(nameError);
            }
        } else { // vendor
            if (!isValidPhone(phone)) {
                displayError(phoneError, 'El teléfono debe tener 9 dígitos.');
                valid = false;
            } else {
                hideError(phoneError);
            }
        }
    }

    if (!valid) return;

    const users = getFromLocalStorage('users');

    if (isRegistering) {
        // Lógica de Registro
        if (users.some(u => u.email === email)) {
            displayError(emailError, 'Este correo ya está registrado.');
            return;
        }

        const newUser = {
            id: Date.now().toString(), // ID único simple
            email,
            password, // En una app real, la contraseña NUNCA se guarda en texto plano
            role: currentRole,
            name: currentRole === 'client' ? name : undefined,
            phone: currentRole === 'vendor' ? phone : undefined
        };
        users.push(newUser);
        saveToLocalStorage('users', users);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        isRegistering = false; // Cambiar a modo login después del registro
        updateAuthFormUI();
    } else {
        // Lógica de Login
        const user = users.find(u => u.email === email && u.password === password && u.role === currentRole);
        if (user) {
            currentUser = user;
            alert(`¡Bienvenido, ${user.name || user.email}!`);
            navigateToPanel(user.role);
        } else {
            displayError(emailError, 'Credenciales incorrectas o rol incorrecto.');
        }
    }
}

function navigateToPanel(role) {
    if (role === 'vendor') {
        showSection(vendorPanel);
        renderVendorProducts();
    } else { // client
        showSection(clientPanel);
        renderAvailableProducts();
        renderClientOrders();
    }
}

// --- Panel del Vendedor ---
function handleProductSubmit(event) {
    event.preventDefault();
    const productName = productNameInput.value.trim();
    const productPrice = parseFloat(productPriceInput.value);

    let valid = true;
    if (!productName) {
        displayError(productNameError, 'El nombre del producto no puede estar vacío.');
        valid = false;
    } else {
        hideError(productNameError);
    }

    if (isNaN(productPrice) || productPrice <= 0) {
        displayError(productPriceError, 'El precio debe ser un número positivo.');
        valid = false;
    } else {
        hideError(productPriceError);
    }

    if (!valid) return;

    const products = getFromLocalStorage('products');
    const newProduct = {
        id: Date.now().toString(),
        name: productName,
        price: productPrice,
        vendorId: currentUser.id,
        vendorEmail: currentUser.email
    };
    products.push(newProduct);
    saveToLocalStorage('products', products);

    productNameInput.value = '';
    productPriceInput.value = '';
    renderVendorProducts();
    alert('Producto agregado con éxito!');
}

function renderVendorProducts() {
    vendorEmailDisplay.textContent = currentUser.email;
    const products = getFromLocalStorage('products');
    const vendorProducts = products.filter(p => p.vendorId === currentUser.id);

    vendorProductsList.innerHTML = ''; // Limpiar lista
    let totalCommission = 0;

    if (vendorProducts.length === 0) {
        noVendorProductsMessage.style.display = 'block';
    } else {
        noVendorProductsMessage.style.display = 'none';
        vendorProducts.forEach(product => {
            const commission = product.price * 0.05;
            totalCommission += commission;

            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <div>
                    <strong>${product.name}</strong> - S/ ${product.price.toFixed(2)}<br>
                    Comisión (5%): S/ ${commission.toFixed(2)}
                </div>
            `;
            vendorProductsList.appendChild(productDiv);
        });
    }
    totalCommissionDisplay.textContent = `S/ ${totalCommission.toFixed(2)}`;
}

// --- Panel del Cliente ---
function renderAvailableProducts() {
    clientNameDisplay.textContent = currentUser.name || currentUser.email;
    const products = getFromLocalStorage('products');

    availableProductsList.innerHTML = ''; // Limpiar lista

    if (products.length === 0) {
        noAvailableProductsMessage.style.display = 'block';
    } else {
        noAvailableProductsMessage.style.display = 'none';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <div>
                    <strong>${product.name}</strong> - S/ ${product.price.toFixed(2)}
                </div>
                <button data-product-id="${product.id}" class="order-btn">Pedir</button>
            `;
            availableProductsList.appendChild(productDiv);
        });

        // AñadirEventListeners a los botones "Pedir"
        document.querySelectorAll('.order-btn').forEach(button => {
            button.onclick = (event) => {
                selectedProductIdForOrder = event.target.dataset.productId;
                const product = products.find(p => p.id === selectedProductIdForOrder);
                orderProductName.textContent = product.name;
                orderProductPrice.textContent = `S/ ${product.price.toFixed(2)}`;
                orderFormContainer.style.display = 'block'; // Mostrar formulario
                deliveryAddressInput.value = ''; // Limpiar campo
                hideError(deliveryAddressError);
            };
        });
    }
}

function handleConfirmOrder() {
    const deliveryAddress = deliveryAddressInput.value.trim();

    if (!deliveryAddress) {
        displayError(deliveryAddressError, 'Por favor, introduce una dirección de entrega.');
        return;
    } else {
        hideError(deliveryAddressError);
    }

    const products = getFromLocalStorage('products');
    const orderedProduct = products.find(p => p.id === selectedProductIdForOrder);

    if (orderedProduct) {
        const orders = getFromLocalStorage('orders');
        const now = new Date(); // Fecha y hora actual
        const newOrder = {
            id: Date.now().toString(),
            productId: orderedProduct.id,
            productName: orderedProduct.name,
            productPrice: orderedProduct.price,
            clientId: currentUser.id,
            clientEmail: currentUser.email,
            deliveryAddress: deliveryAddress,
            orderDate: now.toISOString() // Guarda la fecha en formato ISO para fácil conversión
        };
        orders.push(newOrder);
        saveToLocalStorage('orders', orders);

        alert(`¡Pedido de "${orderedProduct.name}" realizado con éxito!\nEntrega en: ${deliveryAddress}`);
        orderFormContainer.style.display = 'none'; // Ocultar formulario
        selectedProductIdForOrder = null;
        renderClientOrders(); // Actualizar la lista de pedidos del cliente
    } else {
        alert('Error: Producto no encontrado para el pedido.');
    }
}

function renderClientOrders() {
    const orders = getFromLocalStorage('orders');
    const clientOrders = orders.filter(o => o.clientId === currentUser.id);

    clientOrdersList.innerHTML = ''; // Limpiar lista

    if (clientOrders.length === 0) {
        noClientOrdersMessage.style.display = 'block';
    } else {
        noClientOrdersMessage.style.display = 'none';
        clientOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Ordenar por fecha, más reciente primero

        clientOrders.forEach(order => {
            const orderDateTime = new Date(order.orderDate);
            const formattedDate = orderDateTime.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = orderDateTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-item');
            orderDiv.innerHTML = `
                <div>
                    <strong>Producto:</strong> ${order.productName}<br>
                    <strong>Precio:</strong> S/ ${order.productPrice.toFixed(2)}<br>
                    <strong>Fecha:</strong> ${formattedDate}<br>
                    <strong>Hora:</strong> ${formattedTime}<br>
                    <strong>Entrega en:</strong> ${order.deliveryAddress}
                </div>
            `;
            clientOrdersList.appendChild(orderDiv);
        });
    }
}

// --- Lógica de Sesión ---
function checkSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        navigateToPanel(currentUser.role);
    } else {
        showSection(roleSelection);
    }
}

function loginUser(user) {
    currentUser = user;
    saveToLocalStorage('currentUser', currentUser); // Guarda el usuario logueado
    navigateToPanel(currentUser.role);
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser'); // Elimina el usuario logueado de localStorage
    alert('Has cerrado sesión.');
    hideAllSections();
    showSection(roleSelection);
}

// --- Event Listeners ---
btnVendorRole.addEventListener('click', () => {
    currentRole = 'vendor';
    isRegistering = false;
    showSection(authSection);
    updateAuthFormUI();
});

btnClientRole.addEventListener('click', () => {
    currentRole = 'client';
    isRegistering = false;
    showSection(authSection);
    updateAuthFormUI();
});

toggleAuthBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    updateAuthFormUI();
});

authForm.addEventListener('submit', handleAuth);
productForm.addEventListener('submit', handleProductSubmit);
confirmOrderBtn.addEventListener('click', handleConfirmOrder);
cancelOrderBtn.addEventListener('click', () => {
    orderFormContainer.style.display = 'none';
    selectedProductIdForOrder = null;
    hideError(deliveryAddressError);
});
logoutBtn.addEventListener('click', logoutUser);

// --- Inicialización de la Aplicación ---
document.addEventListener('DOMContentLoaded', checkSession); // Verifica sesión al cargar la página
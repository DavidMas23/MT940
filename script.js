let currentAccounts = [];
let filteredAccounts = [];

const sampleAccounts = [
    {
        id: 1,
        accountNumber: "23456789",
        date: "2023-10-28",
        events: [
            { time: "2 min", status: "Ingresado a SAP" }
        ],
        hasTicket: false,
        isReprocessing: false
    },
    {
        id: 2,
        accountNumber: "987654321",
        date: "2023-10-27",
        events: [
            { time: "Pendiente", status: "Pendiente de Ingreso a SAP" }
        ],
        hasTicket: false,
        isReprocessing: false
    },
    {
        id: 3,
        accountNumber: "555555555",
        date: "2023-10-26",
        events: [
            { time: "5 min", status: "Ingresado a SAP" }
        ],
        hasTicket: false,
        isReprocessing: false
    }
];

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const accountsList = document.getElementById('accounts-list');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const filterBtn = document.getElementById('filter-btn');
const toast = document.getElementById('toast');
const toastOverlay = document.getElementById('toast-overlay');
const toastMessage = document.getElementById('toast-message');

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set default date range to match the sample data
    dateFromInput.value = "2023-10-26";
    dateToInput.value = "2023-10-28";
    
    currentAccounts = [...sampleAccounts];
    filteredAccounts = [...currentAccounts];
    
    setupEventListeners();
    
    showLoginScreen();
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    
    logoutBtn.addEventListener('click', handleLogout);
    
    filterBtn.addEventListener('click', applyDateFilter);
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleMenuClick);
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        showDashboard();
        renderAccountsList();
    } else {
        showToast('Por favor, ingrese usuario y contraseña.', 'error');
    }
}

function handleLogout() {
    showLoginScreen();
    loginForm.reset();
}

function handleMenuClick(e) {
    e.preventDefault();
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');
    const module = e.target.dataset.module;
    console.log(`Switching to module: ${module}`);
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function applyDateFilter() {
    const fromDate = new Date(dateFromInput.value);
    const toDate = new Date(dateToInput.value);
    
    if (dateFromInput.value && dateToInput.value) {
        filteredAccounts = currentAccounts.filter(account => {
            const accountDate = new Date(account.date);
            return accountDate >= fromDate && accountDate <= toDate;
        });
    } else {
        filteredAccounts = [...currentAccounts];
    }
    
    renderAccountsList();
    showToast('Filtros aplicados correctamente.', 'success');
}

function renderAccountsList() {
    accountsList.innerHTML = '';
    
    if (filteredAccounts.length === 0) {
        accountsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No se encontraron cuentas para el rango de fechas seleccionado.</div>';
        return;
    }
    
    filteredAccounts.forEach(account => {
        const accountItem = createAccountItem(account);
        accountsList.appendChild(accountItem);
    });
}

function createAccountItem(account) {
    const item = document.createElement('div');
    item.className = `account-item ${account.hasTicket ? 'has-ticket' : ''}`;
    item.innerHTML = `
        <div class="account-header" onclick="toggleAccount(${account.id})">
            <div class="account-info">
                <h3>Cuenta #${account.accountNumber}</h3>
                <div class="date">${formatDisplayDate(account.date)}</div>
            </div>
            <div class="account-status">
                ${account.hasTicket ? '<span class="ticket-status">Ticket abierto</span>' : ''}
                <span class="expand-icon">▼</span>
            </div>
        </div>
        <div class="account-content">
            <div class="timeline">
                ${createTimelineHTML(account.events)}
            </div>
            <div class="action-buttons">
                <button class="action-btn btn-ticket" onclick="openTicket(${account.id})" ${account.hasTicket ? 'disabled' : ''}>
                    Abrir ticket
                </button>
                <button class="action-btn btn-reprocess" onclick="reprocessAccount(${account.id})" ${account.isReprocessing ? 'disabled' : ''}>
                    Volver a subir
                </button>
            </div>
        </div>
    `;
    
    return item;
}

function createTimelineHTML(events) {
    return events.map(event => {
        const statusClass = event.status === 'Ingresado a SAP' ? 'status-ingresado' : 'status-pendiente';
        const icon = event.status === 'Ingresado a SAP' ? '✓' : '⚡';
        return `
            <div class="timeline-item">
                <div class="timeline-icon ${statusClass}">
                    ${icon}
                </div>
                <div class="timeline-content">
                    <div class="timeline-status">${event.status}</div>
                    <div class="timeline-time">Procesado en ${event.time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function toggleAccount(accountId) {
    const accountElement = document.querySelector(`[onclick="toggleAccount(${accountId})"]`).parentElement;
    accountElement.classList.toggle('expanded');
}

function openTicket(accountId) {
    const accountIndex = currentAccounts.findIndex(acc => acc.id === accountId);
    const filteredIndex = filteredAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
        currentAccounts[accountIndex].hasTicket = true;
        filteredAccounts[filteredIndex].hasTicket = true;
        
        renderAccountsList();
        
        showToast('Ticket ingresado, alguien de sistemas se comunicará contigo.', 'success');
    }
}

function reprocessAccount(accountId) {
    const accountIndex = currentAccounts.findIndex(acc => acc.id === accountId);
    const filteredIndex = filteredAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
        currentAccounts[accountIndex].isReprocessing = true;
        filteredAccounts[filteredIndex].isReprocessing = true;
        
        renderAccountsList();
        
        showToast('Volviendo a procesar.', 'info');
        
        setTimeout(() => {
            currentAccounts[accountIndex].isReprocessing = false;
            filteredAccounts[filteredIndex].isReprocessing = false;
            renderAccountsList();
            showToast('Reprocesamiento completado.', 'success');
        }, 3000);
    }
}

function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toastOverlay.classList.add('show');
    
    setTimeout(() => {
        toastOverlay.classList.remove('show');
    }, 3000);
}

function addSampleAccount() {
    const newAccount = {
        id: currentAccounts.length + 1,
        accountNumber: Math.floor(Math.random() * 900000 + 100000).toString(),
        date: formatDate(new Date()),
        events: [
            { time: "08:00 AM", status: "Pendiente de ingreso a SAP" }
        ],
        hasTicket: false,
        isReprocessing: false
    };
    
    currentAccounts.push(newAccount);
    filteredAccounts = [...currentAccounts];
    renderAccountsList();
}

window.toggleAccount = toggleAccount;
window.openTicket = openTicket;
window.reprocessAccount = reprocessAccount;
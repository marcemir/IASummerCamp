console.log('app.js cargado correctamente');

// Elementos del DOM
let splashScreen, userTypeScreen, authScreen, appContainer, loginForm, emailInput, passwordInput, togglePassword, rememberMe, showRegister, messagesContainer, messageForm, messageInput, sendButton, voiceButton, themeToggle, userEmail, logoutButton, studentBtn, teacherBtn;

// Elementos del menú desplegable
let menuButton, dropdownMenu, uploadMaterialBtn, uploadPhotoBtn, myDataBtn;

// Elementos para carga de archivos
let uploadButton, uploadModal, closeModal, dropArea, fileSelector, fileInfo, cancelUpload, confirmUpload, uploadProgress, progressBar, progressText;

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`No se encontró el elemento con ID: ${id}`);
    }
    return element;
}

function initializeDOMElements() {
    console.log('Inicializando elementos del DOM...');
    
    // Pantallas
    splashScreen = getElement('splash-screen');
    userTypeScreen = getElement('user-type-screen');
    authScreen = getElement('auth-screen');
    appContainer = getElement('app-container');
    
    // Botones de selección de tipo de usuario
    studentBtn = getElement('student-btn');
    teacherBtn = getElement('teacher-btn');
    
    // Elementos de autenticación
    loginForm = getElement('login-form');
    emailInput = getElement('email');
    passwordInput = getElement('password');
    togglePassword = getElement('toggle-password');
    rememberMe = getElement('remember-me');
    showRegister = getElement('show-register');
    
    // Elementos del chat
    messagesContainer = getElement('messages');
    messageForm = getElement('message-form');
    messageInput = getElement('message-input');
    sendButton = getElement('send-button');
    voiceButton = getElement('voice-button');
    themeToggle = getElement('theme-toggle');
    userEmail = getElement('user-email');
    logoutButton = getElement('logout-button');
    
    // Elementos del menú desplegable
    menuButton = getElement('menu-button');
    dropdownMenu = getElement('dropdown-menu');
    uploadMaterialBtn = getElement('upload-material');
    uploadPhotoBtn = getElement('upload-photo');
    myDataBtn = getElement('my-data');
    
    // Elementos para carga de archivos
    uploadButton = getElement('upload-button');
    uploadModal = getElement('upload-modal');
    closeModal = document.querySelector('.close-modal');
    dropArea = getElement('drop-area');
    fileSelector = getElement('file-selector');
    fileInfo = getElement('file-info');
    cancelUpload = getElement('cancel-upload');
    confirmUpload = getElement('confirm-upload');
    uploadProgress = getElement('upload-progress');
    progressBar = getElement('progress-bar');
    progressText = getElement('progress-text');
    
    // Verificar elementos críticos
    if (!splashScreen || !authScreen || !appContainer) {
        console.error('Error: No se pudieron cargar los elementos principales del DOM');
        return false;
    }
    
    console.log('Elementos del DOM inicializados correctamente');
    return true;
}

// Estado de la aplicación
let isListening = false;
let recognition = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Inicializar el usuario y token desde el almacenamiento al cargar la página
let currentUser = (() => {
    try {
        const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error('Error al cargar el usuario del almacenamiento:', e);
        return null;
    }
})();

let authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null;
let userType = currentUser?.role || null; // 'student' o 'teacher'

// Inicialización
function init() {
    try {
        console.log('Inicializando la aplicación...');
        
        // Inicializar elementos del DOM
        initializeDOMElements();
        
        // Configurar el tema
        updateTheme();
        
        // Configurar eventos
        setupEventListeners();
        
        // Configurar carga de archivos
        setupFileUploadListeners();
        
        // Verificar autenticación antes de iniciar el flujo
        if (isAuthenticated()) {
            console.log('Usuario ya autenticado:', currentUser?.email);
            
            // Si estamos en la página de login pero ya estamos autenticados, redirigir según el rol
            if (window.location.pathname.endsWith('index.html')) {
                if (currentUser?.role === 'teacher') {
                    window.location.href = 'construction.html';
                } else {
                    // Si es estudiante, mostrar la aplicación principal
                    showApp();
                    loadMessages();
                    if (messagesContainer && messagesContainer.children.length === 0) {
                        addMessage('assistant', `¡Bienvenido de nuevo, ${currentUser.name}! ¿En qué puedo ayudarte hoy?`);
                    }
                }
                return;
            }
        }
        
        // Iniciar el flujo de la aplicación
        startAppFlow();
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

// Flujo de la aplicación
function startAppFlow() {
    try {
        console.log('Iniciando flujo de la aplicación...');
        
        // Verificar que los elementos críticos del DOM estén disponibles
        if (!splashScreen || !authScreen || !appContainer) {
            console.error('Error: Elementos críticos del DOM no están disponibles');
            return;
        }
        
        // Mostrar pantalla de inicio
        showSplashScreen();
        
        // Verificar si hay una sesión activa
        if (isAuthenticated()) {
            console.log('Sesión activa encontrada, redirigiendo...');
            // Pequeño retraso para mostrar la animación de carga
            setTimeout(() => {
                hideSplashScreen();
                if (currentUser.role === 'teacher') {
                    window.location.href = 'construction.html';
                } else {
                    showApp();
                    loadMessages();
                }
            }, 1500);
            return;
        }
        
        // Si no hay sesión activa, continuar con el flujo normal
        console.log('No hay sesión activa, mostrando pantalla de selección de usuario...');
        setTimeout(() => {
            try {
                hideSplashScreen();
                showUserTypeScreen();
            } catch (error) {
                console.error('Error en el flujo de autenticación:', error);
                showAuthScreen();
            }
        }, 1500); // 1.5 segundos para la animación de carga
    } catch (error) {
        console.error('Error crítico en startAppFlow:', error);
        // Mostrar un mensaje de error genérico
        if (document.body) {
            document.body.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
                    <h2>¡Ups! Algo salió mal</h2>
                    <p>No se pudo cargar la aplicación correctamente.</p>
                    <p>Por favor, recarga la página o inténtalo de nuevo más tarde.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                        Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    try {
        // Verificar si ya tenemos el usuario en memoria
        if (currentUser && authToken) {
            console.log('Usuario ya está en memoria:', currentUser.email);
            return true;
        }
        
        // Buscar en localStorage y sessionStorage
        const storageTypes = [localStorage, sessionStorage];
        
        for (const storage of storageTypes) {
            try {
                const storedUser = storage.getItem('currentUser');
                const storedToken = storage.getItem('authToken');
                
                if (storedUser && storedToken) {
                    const user = JSON.parse(storedUser);
                    
                    // Validar estructura del usuario
                    if (user && typeof user === 'object' && user.id && user.email) {
                        console.log('Usuario autenticado encontrado en', storage === localStorage ? 'localStorage' : 'sessionStorage');
                        
                        // Actualizar estado global
                        currentUser = user;
                        authToken = storedToken;
                        userType = user.role || 'student';
                        
                        // Si el token está en sessionStorage, moverlo a localStorage si es necesario
                        if (storage === sessionStorage && rememberMe?.checked) {
                            localStorage.setItem('currentUser', storedUser);
                            localStorage.setItem('authToken', storedToken);
                            sessionStorage.removeItem('currentUser');
                            sessionStorage.removeItem('authToken');
                            console.log('Sesión movida a localStorage');
                        }
                        
                        return true;
                    } else {
                        console.warn('Datos de usuario inválidos en el almacenamiento');
                        storage.removeItem('currentUser');
                        storage.removeItem('authToken');
                    }
                }
            } catch (e) {
                console.error('Error al verificar el almacenamiento:', e);
                // Limpiar datos corruptos
                storage.removeItem('currentUser');
                storage.removeItem('authToken');
            }
        }
        
        console.log('No se encontró una sesión activa');
        return false;
    } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        return false;
    }
}

// Función para mostrar errores de validación
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Enfocar el campo con error
    input.focus();
    return false;
}

// Función para limpiar errores de validación
function clearError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Validar un campo individual
function validateField(input) {
    const value = input.value.trim();
    const type = input.getAttribute('data-validate');
    
    // Limpiar errores previos
    clearError(input);
    
    // Validar campo requerido
    if (input.required && !value) {
        return showError(input, 'Este campo es obligatorio');
    }
    
    // Validaciones específicas por tipo
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return showError(input, 'Por favor, introduce un correo electrónico válido');
        }
    }
    
    if (type === 'password' && value) {
        if (value.length < 6) {
            return showError(input, 'La contraseña debe tener al menos 6 caracteres');
        }
    }
    
    return true;
}

// Validar todo el formulario
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[data-validate]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Manejar inicio de sesión (versión fake para MVP)
function handleLogin(email, password, remember) {
    console.log(`Intento de inicio de sesión con email: ${email}`);
    
    try {
        // Limpiar errores previos
        if (emailInput) clearError(emailInput);
        if (passwordInput) clearError(passwordInput);
        
        // Validar campos
        let isValid = true;
        
        // Validar email
        if (!email) {
            showError(emailInput, 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError(emailInput, 'Por favor, introduce un correo electrónico válido');
            isValid = false;
        }
        
        // Validar contraseña
        if (!password) {
            showError(passwordInput, 'La contraseña es obligatoria');
            isValid = false;
        } else if (password.length < 6) {
            showError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }
        
        if (!isValid) {
            return false;
        }
        
        // Mostrar indicador de carga
        const loginButton = document.querySelector('#login-form button[type="submit"]');
        const originalButtonText = loginButton ? loginButton.innerHTML : '';
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        }
        
        // Simular una pequeña demora para la autenticación
        setTimeout(() => {
            try {
                // Asegurarse de que userType esté definido
                const userRole = userType || 'student';
                
                // Datos de usuario de ejemplo
                const userData = {
                    id: 'user-' + Math.random().toString(36).substr(2, 9),
                    email: email.trim().toLowerCase(),
                    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), // Capitalizar nombre
                    role: userRole,
                    lastLogin: new Date().toISOString()
                };
                
                // Actualizar userType global
                userType = userRole;
                
                // Determinar el almacenamiento a usar
                const storage = remember ? localStorage : sessionStorage;
                const otherStorage = remember ? sessionStorage : localStorage;
                
                try {
                    // Guardar en el almacenamiento seleccionado
                    storage.setItem('currentUser', JSON.stringify(userData));
                    storage.setItem('authToken', 'fake-jwt-token-' + Date.now());
                    
                    // Limpiar el otro almacenamiento para evitar conflictos
                    otherStorage.removeItem('currentUser');
                    otherStorage.removeItem('authToken');
                    
                    console.log(`Sesión guardada en ${remember ? 'localStorage' : 'sessionStorage'}`);
                    
                    // Actualizar el estado global
                    currentUser = userData;
                    authToken = storage.getItem('authToken');
                    
                    console.log('Usuario autenticado:', currentUser);
                    
                    // Actualizar la interfaz de usuario
                    updateUIAfterLogin();
                    
                    // Redirigir o mostrar la aplicación después de un breve retraso
                    setTimeout(() => {
                        // Verificar si es un profesor para redirigir a la página de construcción
                        if (currentUser.role === 'teacher') {
                            window.location.href = 'construction.html';
                            return;
                        }
                        
                        // Si es estudiante, mostrar la aplicación principal
                        showApp();
                        
                        // Cargar mensajes existentes
                        loadMessages();
                        
                        // Mostrar mensaje de bienvenida si no hay mensajes
                        if (messagesContainer && messagesContainer.children.length === 0) {
                            addMessage('assistant', `¡Bienvenido a SocratIA, ${currentUser.name}! ¿En qué puedo ayudarte hoy?`);
                        }
                        
                        // Hacer foco en el campo de entrada de mensajes
                        if (messageInput) {
                            messageInput.focus();
                        }
                    }, 350);
                    
                    return true;
                } catch (storageError) {
                    console.error('Error al guardar la sesión:', storageError);
                    alert('No se pudo guardar la sesión. Por favor, inténtalo de nuevo.');
                    return false;
                }
            } catch (error) {
                console.error('Error durante el proceso de autenticación:', error);
                // Mostrar mensaje de error al usuario
                alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
                return false;
            }
        }, 500); // Simular tiempo de autenticación
        
        return true; // Devolver true inmediatamente mientras se procesa la autenticación
    } catch (error) {
        console.error('Error en handleLogin:', error);
        alert('Se produjo un error al intentar iniciar sesión. Por favor, recarga la página e inténtalo de nuevo.');
        return false;
    }
}

// Actualizar la interfaz de usuario después del inicio de sesión
function updateUIAfterLogin() {
    try {
        // Restaurar el botón de inicio de sesión
        const loginButton = document.querySelector('#login-form button[type="submit"]');
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Iniciar sesión';
        }
        
        // Actualizar el correo del usuario en la interfaz si existe el elemento
        if (userEmail) {
            userEmail.textContent = currentUser.email;
        }
        
        // Actualizar el menú de usuario si existe
        // Mantenemos el texto 'Menú' en lugar del nombre del usuario
        if (menuButton) {
            const menuText = menuButton.querySelector('.menu-text');
            if (menuText) {
                menuText.textContent = 'Menú';
            }
        }
        
        // Ocultar pantalla de autenticación con transición
        hideAuthScreen();
        
        // Mostrar notificación de éxito
        if (typeof showNotification === 'function') {
            showNotification(`¡Bienvenido/a de nuevo, ${currentUser.name}!`, 'success');
        } else {
            console.log(`¡Bienvenido/a de nuevo, ${currentUser.name}!`);
        }
    } catch (error) {
        console.error('Error al actualizar la interfaz después del inicio de sesión:', error);
    }
}

// Manejar cierre de sesión
function handleLogout() {
    try {
        console.log('Cerrando sesión...');
        
        // Guardar el correo del usuario para futura referencia
        const userEmail = currentUser ? currentUser.email : null;
        
        // Limpiar el estado de la aplicación
        currentUser = null;
        authToken = null;
        
        // Limpiar el almacenamiento local y de sesión
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
        
        console.log('Datos de sesión eliminados');
        
        // Si estamos en la página de construcción, redirigir a index.html
        if (window.location.pathname.endsWith('construction.html') || window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Ocultar la aplicación y mostrar la pantalla de autenticación
        hideApp();
        
        // Limpiar el formulario de inicio de sesión si existe
        if (loginForm) {
            loginForm.reset();
            // Restaurar el correo electrónico si existe
            if (userEmail && emailInput) {
                emailInput.value = userEmail;
                // Marcar el checkbox de recordar usuario
                if (rememberMe) {
                    rememberMe.checked = true;
                }
            }
        }
        
        // Mostrar la pantalla de selección de tipo de usuario
        showUserTypeScreen();
        
        console.log('Sesión cerrada correctamente');
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Intentar redirigir a la pantalla de autenticación de todos modos
        if (authScreen) {
            showAuthScreen();
        }
        return false;
    }
}

// Mostrar/ocultar pantallas
function showUserTypeScreen() {
    try {
        console.log('Mostrando pantalla de selección de tipo de usuario');
        if (userTypeScreen) {
            userTypeScreen.classList.remove('hidden');
        } else {
            console.error('Error: No se pudo encontrar el elemento userTypeScreen');
        }
    } catch (error) {
        console.error('Error al mostrar la pantalla de selección de tipo de usuario:', error);
    }
}

function hideUserTypeScreen() {
    try {
        if (userTypeScreen) {
            userTypeScreen.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error al ocultar la pantalla de selección de tipo de usuario:', error);
    }
}

function showSplashScreen() {
    console.log('Mostrando pantalla de inicio...');
    if (splashScreen) {
        // Asegurarse de que no esté oculto por CSS
        splashScreen.classList.remove('hidden');
        splashScreen.style.display = 'flex';
        // Forzar un reflow para que la transición funcione
        void splashScreen.offsetHeight;
        splashScreen.style.opacity = '1';
    } else {
        console.error('No se pudo mostrar la pantalla de inicio: elemento no encontrado');
    }
}

function hideSplashScreen() {
    console.log('Ocultando pantalla de inicio...');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            splashScreen.classList.add('hidden');
        }, 300);
    }
}

function showAuthScreen() {
    console.log('Mostrando pantalla de autenticación...');
    if (authScreen) {
        // Asegurarse de que no esté oculto por CSS
        authScreen.classList.remove('hidden');
        authScreen.style.display = 'flex';
        // Forzar un reflow para que la transición funcione
        void authScreen.offsetHeight;
        setTimeout(() => {
            authScreen.style.opacity = '1';
        }, 10);
    } else {
        console.error('No se pudo mostrar la pantalla de autenticación: elemento no encontrado');
    }
}

function hideAuthScreen() {
    console.log('Ocultando pantalla de autenticación...');
    if (authScreen) {
        authScreen.style.opacity = '0';
        setTimeout(() => {
            authScreen.style.display = 'none';
            authScreen.classList.add('hidden');
        }, 300);
    }
}

function showApp() {
    console.log('Mostrando aplicación...');
    if (appContainer) {
        // Asegurarse de que no esté oculto por CSS
        appContainer.classList.remove('hidden');
        appContainer.style.display = 'flex';
        // Forzar un reflow para que la transición funcione
        void appContainer.offsetHeight;
        setTimeout(() => {
            appContainer.style.opacity = '1';
        }, 10);
    } else {
        console.error('No se pudo mostrar la aplicación: elemento no encontrado');
    }
}

function hideApp() {
    console.log('Ocultando aplicación...');
    if (appContainer) {
        appContainer.style.opacity = '0';
        setTimeout(() => {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }, 300);
    }
}

// Configurar los event listeners
function setupEventListeners() {
    // Eventos de selección de tipo de usuario
    if (studentBtn) {
        studentBtn.addEventListener('click', () => {
            console.log('Seleccionado: Estudiante');
            userType = 'student';
            hideUserTypeScreen();
            showAuthScreen();
        });
    }
    
    if (teacherBtn) {
        teacherBtn.addEventListener('click', () => {
            console.log('Seleccionado: Profesor');
            userType = 'teacher';
            hideUserTypeScreen();
            showAuthScreen();
        });
    }
    
    // Eventos de autenticación
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberMe.checked;
            
            if (email && password) {
                handleLogin(email, password, remember);
            }
        });
    }
    
    // Mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Menú desplegable
    if (menuButton && dropdownMenu) {
        // Mostrar/ocultar menú al hacer clic
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isExpanded);
            dropdownMenu.setAttribute('aria-hidden', isExpanded);
            
            // Agregar clase para el fondo oscuro en móvil
            if (window.innerWidth <= 768) {
                if (!isExpanded) {
                    document.body.style.overflow = 'hidden';
                    document.body.classList.add('menu-open');
                } else {
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                }
            }
        });
        
        // Cerrar menú al hacer clic fuera o en el fondo oscuro
        document.addEventListener('click', (e) => {
            const isMenuOpen = menuButton.getAttribute('aria-expanded') === 'true';
            const isClickInsideMenu = dropdownMenu.contains(e.target) || menuButton.contains(e.target);
            
            if (isMenuOpen && !isClickInsideMenu) {
                closeMenu();
            }
        });
        
        // Cerrar menú al hacer scroll en móvil
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const st = window.pageYOffset || document.documentElement.scrollTop;
                if (Math.abs(st - lastScrollTop) > 10) {
                    closeMenu();
                }
                lastScrollTop = st <= 0 ? 0 : st;
            }
        });
        
        // Función para cerrar el menú
        function closeMenu() {
            menuButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        }
    }
    
    // Eventos de los elementos del menú
    if (uploadMaterialBtn) {
        uploadMaterialBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Subir material');
            showUploadModal();
            menuButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Subir foto');
            // Aquí puedes implementar la lógica para subir una foto
            alert('Función de subir foto en desarrollo');
            menuButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (myDataBtn) {
        myDataBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Ver mis datos');
            // Aquí puedes implementar la lógica para mostrar los datos del usuario
            alert('Función de mis datos en desarrollo');
            menuButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            menuButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Enviar mensaje al hacer submit
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Enviar mensaje al hacer clic en el botón
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Controlar el botón de voz
    if (voiceButton) {
        voiceButton.addEventListener('click', toggleVoiceRecognition);
    }
    
    // Alternar tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Permitir enviar mensaje con Shift+Enter para saltar línea
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Añadir un mensaje al chat
function addMessage(role, content, timestamp = new Date()) {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${role}`;
    
    const timeString = timestamp.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
    
    // Guardar mensaje en el almacenamiento local
    saveMessage(role, content, timestamp);
}

// Mostrar indicador de escritura
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    messagesContainer.appendChild(typingElement);
    scrollToBottom();
}

// Ocultar indicador de escritura
function hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// Enviar mensaje
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    // Añadir mensaje del usuario
    const userMessage = content;
    addMessage('user', userMessage);
    
    // Limpiar el input
    messageInput.value = '';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Simular respuesta del servidor (reemplazar con llamada real a la API)
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = `He recibido tu mensaje: "${userMessage}". En una implementación real, esto sería una respuesta generada por IA.`;
        addMessage('assistant', botResponse);
    }, 1000);
}

// Inicializar reconocimiento de voz
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('El reconocimiento de voz no es compatible con este navegador');
        voiceButton.disabled = true;
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
    };
    
    recognition.onerror = (event) => {
        console.error('Error en el reconocimiento de voz:', event.error);
        stopVoiceRecognition();
    };
    
    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        }
    };
}

// Alternar reconocimiento de voz
function toggleVoiceRecognition() {
    if (isListening) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
}

// Iniciar reconocimiento de voz
function startVoiceRecognition() {
    if (!recognition) return;
    
    try {
        recognition.start();
        isListening = true;
        voiceButton.classList.add('recording');
        voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
    } catch (error) {
        console.error('Error al iniciar el reconocimiento de voz:', error);
    }
}

// Detener reconocimiento de voz
function stopVoiceRecognition() {
    if (!recognition) return;
    
    try {
        recognition.stop();
        isListening = false;
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    } catch (error) {
        console.error('Error al detener el reconocimiento de voz:', error);
    }
}

// Alternar entre temas claro y oscuro
function toggleTheme() {
    isDarkMode = !isDarkMode;
    updateTheme();
    localStorage.setItem('darkMode', isDarkMode);
}

// Actualizar el tema según el estado actual
function updateTheme() {
    document.body.classList.toggle('dark-theme', isDarkMode);
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Desplazarse al final de los mensajes
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Guardar mensaje en el almacenamiento local
function saveMessage(role, content, timestamp) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.push({ role, content, timestamp: timestamp.toISOString() });
    
    // Mantener solo los últimos 100 mensajes para no llenar el almacenamiento local
    if (messages.length > 100) {
        messages.shift();
    }
    
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Cargar mensajes guardados
function loadMessages() {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    
    savedMessages.forEach(msg => {
        addMessage(msg.role, msg.content, new Date(msg.timestamp));
    });
}

// Función para mostrar el modal de carga de archivos
function showUploadModal() {
    console.log('Intentando mostrar el modal de carga...');
    
    if (!uploadModal) {
        console.error('Error: No se encontró el elemento del modal (uploadModal)');
        return;
    }
    
    console.log('Mostrando modal de carga...');
    uploadModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Forzar el foco en el modal para accesibilidad
    uploadModal.setAttribute('aria-hidden', 'false');
    
    // Reiniciar la interfaz de usuario
    resetFileUploadUI();
    
    // Hacer que el modal sea enfocable
    uploadModal.tabIndex = -1;
    uploadModal.focus();
    
    console.log('Modal de carga mostrado');
}

// Función para ocultar el modal de carga de archivos
function hideUploadModal() {
    if (uploadModal) {
        uploadModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Función para reiniciar la interfaz de carga de archivos
function resetFileUploadUI() {
    if (fileInfo) fileInfo.innerHTML = '';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    if (uploadProgress) uploadProgress.style.display = 'none';
    if (confirmUpload) confirmUpload.disabled = true;
    if (fileSelector) fileSelector.value = '';
    
    // Mostrar el mensaje inicial nuevamente
    const fileUploadContent = document.querySelector('.file-upload-content');
    if (fileUploadContent) {
        const initialMessage = fileUploadContent.querySelector('p');
        if (initialMessage) initialMessage.style.display = 'block';
    }
}

// Función para manejar la selección de archivos
function handleFileSelect(event) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.target.files || (event.dataTransfer ? event.dataTransfer.files : []);
    if (files.length > 0) {
        updateFileInfo(files[0]);
    }
}

// Función para actualizar la información del archivo seleccionado
function updateFileInfo(file) {
    if (!file) return;

    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convertir a MB
    const fileType = file.name.split('.').pop().toUpperCase();
    
    // Ocultar el mensaje inicial
    const fileUploadContent = document.querySelector('.file-upload-content');
    if (fileUploadContent) {
        const initialMessage = fileUploadContent.querySelector('p');
        if (initialMessage) initialMessage.style.display = 'none';
    }

    fileInfo.innerHTML = `
        <div class="file-preview">
            <i class="fas fa-file-alt"></i>
            <div class="file-details">
                <span class="file-name">${file.name}</span>
                <span class="file-meta">${fileType} • ${fileSize} MB</span>
            </div>
            <button type="button" class="remove-file" title="Eliminar archivo">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Habilitar el botón de confirmación
    if (confirmUpload) confirmUpload.disabled = false;

    // Agregar evento al botón de eliminar
    const removeBtn = fileInfo.querySelector('.remove-file');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetFileUploadUI();
            if (fileSelector) fileSelector.value = '';
        });
    }
}

// Función para manejar el arrastrar y soltar archivos
function setupDragAndDrop() {
    if (!dropArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-over');
        });
    });

    dropArea.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            updateFileInfo(files[0]);
            // Actualizar el input file para que tenga el archivo seleccionado
            if (fileSelector) {
                fileSelector.files = files;
            }
        }
    }
}

// Función para subir el archivo al servidor
async function uploadFile() {
    if (!fileSelector || !fileSelector.files || fileSelector.files.length === 0) {
        alert('Por favor, selecciona un archivo primero.');
        return;
    }

    const file = fileSelector.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser ? currentUser.id : 'anonymous');

    try {
        // Mostrar la barra de progreso
        if (uploadProgress) uploadProgress.style.display = 'block';
        if (confirmUpload) confirmUpload.disabled = true;

        // Aquí debes reemplazar la URL con tu endpoint de n8n
        const response = await fetch('https://tu-endpoint-n8n.com/upload', {
            method: 'POST',
            body: formData,
            // Opcional: Agregar headers de autenticación si es necesario
            // headers: {
            //     'Authorization': `Bearer ${authToken}`
            // },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (progressBar) progressBar.style.width = `${percentComplete}%`;
                    if (progressText) progressText.textContent = `${percentComplete}%`;
                }
            }
        });

        if (!response.ok) {
            throw new Error(`Error al subir el archivo: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Archivo subido exitosamente:', result);

        // Mostrar mensaje de éxito
        addMessage('assistant', `He recibido tu archivo "${file.name}". ¿En qué puedo ayudarte con él?`);

        // Cerrar el modal después de un breve retraso
        setTimeout(() => {
            hideUploadModal();
        }, 1000);

    } catch (error) {
        console.error('Error al subir el archivo:', error);
        alert(`Error al subir el archivo: ${error.message}`);

        // Reiniciar la interfaz en caso de error
        resetFileUploadUI();
        if (confirmUpload) confirmUpload.disabled = false;
    }
}

// Configurar los event listeners para la carga de archivos
function setupFileUploadListeners() {
    console.log('Iniciando configuración de listeners de carga de archivos...');
    
    if (!uploadButton) {
        console.error('Error: No se encontró el botón de carga (uploadButton)');
    } else {
        console.log('Añadiendo evento click al botón de carga...');
        uploadButton.addEventListener('click', function(e) {
            console.log('Botón de carga clickeado');
            showUploadModal();
        });
    }

    // Cerrar el modal al hacer clic en la X
    if (closeModal) {
        console.log('Añadiendo evento click al botón de cerrar...');
        closeModal.addEventListener('click', function() {
            console.log('Botón cerrar clickeado');
            hideUploadModal();
        });
    } else {
        console.error('Error: No se encontró el botón de cerrar (closeModal)');
    }

    // Cerrar el modal al hacer clic en cancelar
    if (cancelUpload) {
        console.log('Añadiendo evento click al botón de cancelar...');
        cancelUpload.addEventListener('click', function() {
            console.log('Botón cancelar clickeado');
            hideUploadModal();
        });
    } else {
        console.error('Error: No se encontró el botón de cancelar (cancelUpload)');
    }

    // Cerrar el modal al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            console.log('Clic fuera del modal, cerrando...');
            hideUploadModal();
        }
    });

    // Verificar si el selector de archivos está disponible
    if (!fileSelector) {
        console.error('Error: No se encontró el selector de archivos (fileSelector)');
    } else {
        console.log('Añadiendo evento change al selector de archivos...');
        fileSelector.addEventListener('change', function(e) {
            console.log('Archivo seleccionado:', e.target.files[0]?.name || 'ninguno');
            handleFileSelect(e);
        });
        
        // Añadir manejador de clic al texto "haz clic para seleccionar"
        const browseFiles = document.querySelector('.browse-files');
        if (browseFiles) {
            console.log('Añadiendo evento click al texto de selección de archivos...');
            browseFiles.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Texto de selección de archivos clickeado');
                fileSelector.click();
            });
        } else {
            console.error('Error: No se encontró el elemento .browse-files');
        }
        
        // También hacer que toda el área de carga sea clickeable
        const fileUploadContent = document.querySelector('.file-upload-content');
        if (fileUploadContent) {
            console.log('Añadiendo evento click al área de carga...');
            fileUploadContent.addEventListener('click', function(e) {
                // Solo activar el selector de archivos si no se hizo clic en un botón u otro elemento interactivo
                if (e.target === fileUploadContent || e.target.tagName === 'P' || e.target.tagName === 'I') {
                    console.log('Área de carga clickeada');
                    fileSelector.click();
                }
            });
        }
    }

    // Configurar arrastrar y soltar si el área está disponible
    if (!dropArea) {
        console.error('Error: No se encontró el área de arrastrar y soltar (dropArea)');
    } else {
        console.log('Configurando arrastrar y soltar...');
        setupDragAndDrop();
    }

    // Configurar el botón de confirmar si está disponible
    if (!confirmUpload) {
        console.error('Error: No se encontró el botón de confirmar (confirmUpload)');
    } else {
        console.log('Añadiendo evento click al botón de confirmar...');
        confirmUpload.addEventListener('click', function() {
            console.log('Botón confirmar clickeado');
            uploadFile();
        });
    }
    
    console.log('Configuración de listeners de carga de archivos completada');
}

// Inicializar la aplicación cuando el DOM esté listo
function initializeApp() {
    console.log('Inicializando aplicación...');
    
    // Inicializar elementos del DOM
    const domInitialized = initializeDOMElements();
    console.log('Elementos del DOM inicializados:', domInitialized);
    
    // Configurar event listeners generales
    setupEventListeners();
    
    // Configurar event listeners para carga de archivos
    console.log('Configurando listeners de carga de archivos...');
    setupFileUploadListeners();
    
    // Verificar si los elementos de carga de archivos están disponibles
    console.log('Elemento uploadButton:', uploadButton);
    console.log('Elemento uploadModal:', uploadModal);
    console.log('Elemento fileSelector:', fileSelector);
    console.log('Elemento dropArea:', dropArea);
    
    // Iniciar flujo de la aplicación
    startAppFlow();
}

// Verificar si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM ya está listo
    initializeApp();
}

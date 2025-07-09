console.log('app.js cargado correctamente');

// Elementos del DOM
let splashScreen, authScreen, appContainer, loginForm, emailInput, passwordInput, togglePassword, rememberMe, showRegister, messagesContainer, messageForm, messageInput, sendButton, voiceButton, themeToggle, userEmail, logoutButton;

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
    authScreen = getElement('auth-screen');
    appContainer = getElement('app-container');
    
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
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let authToken = localStorage.getItem('authToken');

// Inicialización
function init() {
    console.log('Iniciando aplicación...');
    
    try {
        // Inicializar elementos del DOM
        if (!initializeDOMElements()) {
            console.error('Error crítico: No se pudieron inicializar los elementos del DOM');
            return;
        }
        
        // Cargar preferencias del tema
        updateTheme();
        
        // Configurar reconocimiento de voz
        initSpeechRecognition();
        
        // Configurar eventos
        setupEventListeners();
        
        // Iniciar flujo de autenticación
        startAppFlow();
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error durante la inicialización de la aplicación:', error);
        // Mostrar mensaje de error al usuario
        alert('Se produjo un error al cargar la aplicación. Por favor, recarga la página.');
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
        
        // Después de 3 segundos, verificar autenticación
        console.log('Mostrando pantalla de inicio por 3 segundos...');
        setTimeout(() => {
            try {
                hideSplashScreen();
                
                // Siempre mostrar la pantalla de autenticación, incluso si hay una sesión guardada
                // para forzar al usuario a iniciar sesión manualmente
                showAuthScreen();
                
                // Limpiar cualquier sesión existente
                currentUser = null;
                authToken = null;
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('currentUser');
                sessionStorage.removeItem('authToken');
            } catch (error) {
                console.error('Error en el flujo de autenticación:', error);
                // Mostrar pantalla de autenticación en caso de error
                showAuthScreen();
            }
        }, 3000); // 3 segundos
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
        // Verificar si hay un usuario en localStorage o sessionStorage
        const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
            try {
                // Intentar analizar el usuario almacenado
                const user = JSON.parse(storedUser);
                
                // Verificar que el usuario tenga los campos requeridos
                if (user && user.id && user.email) {
                    console.log('Usuario autenticado encontrado:', user.email);
                    currentUser = user; // Actualizar el usuario actual
                    authToken = storedToken; // Actualizar el token
                    return true;
                }
            } catch (error) {
                console.error('Error al analizar los datos del usuario:', error);
                // Limpiar datos inválidos
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
            }
        }
        
        console.log('No se encontró un usuario autenticado');
        return false;
    } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        return false;
    }
}

// Manejar inicio de sesión (versión fake para MVP)
function handleLogin(email, password, remember) {
    console.log(`Intento de inicio de sesión con email: ${email}`);
    
    try {
        // Validar parámetros
        if (!email || !password) {
            console.error('Email y contraseña son requeridos');
            return false;
        }
        
        // Simular una pequeña demora para la autenticación
        setTimeout(() => {
            try {
                // Datos de usuario de ejemplo
                currentUser = {
                    id: 'user-123',
                    email: email,
                    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), // Capitalizar nombre
                    role: 'student'
                };
                
                // Guardar en localStorage si se seleccionó "Recordarme"
                if (remember) {
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    localStorage.setItem('authToken', 'fake-jwt-token');
                } else {
                    // Para la sesión actual
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                    sessionStorage.setItem('authToken', 'fake-jwt-token');
                }
                
                console.log('Usuario autenticado:', currentUser);
                
                // Actualizar el correo del usuario en la interfaz si existe el elemento
                if (userEmail) {
                    userEmail.textContent = currentUser.email;
                }
                
                // Ocultar pantalla de autenticación con transición
                hideAuthScreen();
                
                // Pequeño retraso antes de mostrar la aplicación para permitir la transición
                setTimeout(() => {
                    // Mostrar la aplicación principal
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
                }, 350); // Tiempo ligeramente mayor que la duración de la transición
                
                return true;
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
// Manejar cierre de sesión
function handleLogout() {
    try {
        console.log('Cerrando sesión...');
        
        // Limpiar datos de autenticación en memoria
        currentUser = null;
        authToken = null;
        
        // Limpiar almacenamiento local y de sesión
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
        
        // Limpiar mensajes del contenedor si existe
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Ocultar la aplicación con transición
        hideApp();
        
        // Pequeño retraso antes de mostrar la pantalla de autenticación
        setTimeout(() => {
            // Mostrar pantalla de autenticación
            showAuthScreen();
            
            // Restablecer el formulario de inicio de sesión si existe
            if (loginForm) {
                loginForm.reset();
            }
            
            // Hacer foco en el campo de correo electrónico si existe
            if (emailInput) {
                emailInput.focus();
            }
            
            console.log('Sesión cerrada correctamente');
        }, 350); // Tiempo ligeramente mayor que la duración de la transición
        
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
    
    // Cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
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

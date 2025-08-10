/**
 * DIVERGEN-T JAVASCRIPT
 * Script principal para funcionalidades del sitio web
 * Siguiendo principios SOLID y buenas prácticas
 */

// ===================================
// CONFIGURACIÓN Y CONSTANTES
// ===================================

const CONFIG = {
    animationDuration: 300,
    scrollOffset: 80,
    debounceDelay: 100,
    intersectionThreshold: 0.1,
    loadingMinTime: 1500
};

const SELECTORS = {
    loading: '#loading',
    navbar: '#navbar',
    mobileMenuBtn: '#mobile-menu-btn',
    mobileMenu: '#mobile-menu',
    backToTop: '#back-to-top',
    contactForm: '#contact-form',
    serviceCards: '.service-card',
    scrollElements: '.animate-on-scroll',
    navLinks: '.nav-link, .mobile-nav-link',
    scrollButtons: '[data-scroll]'
};

// ===================================
// UTILIDADES
// ===================================

class Utils {
    /**
     * Debounce function para optimizar eventos que se disparan frecuentemente
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} - Función debounced
     */
    static debounce(func, wait = CONFIG.debounceDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function para limitar la frecuencia de ejecución
     * @param {Function} func - Función a ejecutar
     * @param {number} limit - Límite de tiempo en ms
     * @returns {Function} - Función throttled
     */
    static throttle(func, limit = CONFIG.debounceDelay) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Smooth scroll a un elemento específico
     * @param {string} targetId - ID del elemento target
     */
    static smoothScrollTo(targetId) {
        const element = document.querySelector(targetId);
        if (element) {
            const offsetTop = element.offsetTop - CONFIG.scrollOffset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Añade clase con animación
     * @param {Element} element - Elemento DOM
     * @param {string} className - Clase a añadir
     */
    static addClassWithAnimation(element, className) {
        element.classList.add(className);
    }

    /**
     * Remueve clase con animación
     * @param {Element} element - Elemento DOM
     * @param {string} className - Clase a remover
     */
    static removeClassWithAnimation(element, className) {
        element.classList.remove(className);
    }
}

// ===================================
// GESTOR DE CARGA (LOADING)
// ===================================

class LoadingManager {
    constructor() {
        this.loadingElement = document.querySelector(SELECTORS.loading);
        this.startTime = Date.now();
    }

    /**
     * Inicializa el loading manager
     */
    init() {
        if (this.loadingElement) {
            // Asegurar tiempo mínimo de loading para mejor UX
            window.addEventListener('load', () => {
                const elapsedTime = Date.now() - this.startTime;
                const remainingTime = Math.max(0, CONFIG.loadingMinTime - elapsedTime);
                
                setTimeout(() => {
                    this.hideLoading();
                }, remainingTime);
            });
        }
    }

    /**
     * Oculta la pantalla de carga
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Remover elemento del DOM después de la animación
            setTimeout(() => {
                this.loadingElement.remove();
            }, 500);
        }
    }
}

// ===================================
// GESTOR DE NAVEGACIÓN
// ===================================

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector(SELECTORS.navbar);
        this.mobileMenuBtn = document.querySelector(SELECTORS.mobileMenuBtn);
        this.mobileMenu = document.querySelector(SELECTORS.mobileMenu);
        this.navLinks = document.querySelectorAll(SELECTORS.navLinks);
        this.scrollButtons = document.querySelectorAll(SELECTORS.scrollButtons);
        this.isMenuOpen = false;
        this.lastScrollY = window.scrollY;
    }

    /**
     * Inicializa el navigation manager
     */
    init() {
        this.bindEvents();
        this.handleScroll(); // Llamada inicial
    }

    /**
     * Vincula eventos de navegación
     */
    bindEvents() {
        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e));
        });

        // Scroll buttons
        this.scrollButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleScrollButtonClick(e));
        });

        // Scroll events
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 16));

        // Resize events
        window.addEventListener('resize', Utils.debounce(() => this.handleResize()));

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    /**
     * Toggle del menú móvil
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.mobileMenu) {
            this.mobileMenu.classList.toggle('active', this.isMenuOpen);
        }

        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.classList.toggle('active', this.isMenuOpen);
        }

        // Prevenir scroll en body cuando el menú está abierto
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    /**
     * Cierra el menú móvil
     */
    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    /**
     * Maneja el click en links de navegación
     * @param {Event} e - Evento de click
     */
    handleNavLinkClick(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            Utils.smoothScrollTo(href);
            this.closeMobileMenu();
        }
    }

    /**
     * Maneja el click en botones de scroll
     * @param {Event} e - Evento de click
     */
    handleScrollButtonClick(e) {
        const scrollTarget = e.currentTarget.getAttribute('data-scroll');
        if (scrollTarget) {
            Utils.smoothScrollTo(`#${scrollTarget}`);
        }
    }

    /**
     * Maneja el scroll de la página
     */
    handleScroll() {
        const currentScrollY = window.scrollY;

        // Navbar scroll effects
        if (this.navbar) {
            if (currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
        }

        this.lastScrollY = currentScrollY;
    }

    /**
     * Maneja el resize de ventana
     */
    handleResize() {
        // Cerrar menú móvil en pantallas grandes
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Maneja clicks fuera del menú móvil
     * @param {Event} e - Evento de click
     */
    handleOutsideClick(e) {
        if (this.isMenuOpen && 
            !this.mobileMenu?.contains(e.target) && 
            !this.mobileMenuBtn?.contains(e.target)) {
            this.closeMobileMenu();
        }
    }
}

// ===================================
// GESTOR DE ANIMACIONES
// ===================================

class AnimationManager {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
    }

    /**
     * Inicializa el animation manager
     */
    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    /**
     * Configura el Intersection Observer
     */
    setupIntersectionObserver() {
        const options = {
            threshold: CONFIG.intersectionThreshold,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, options);
    }

    /**
     * Observa elementos para animación
     */
    observeElements() {
        // Observar secciones principales
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('animate-on-scroll');
            this.observer.observe(section);
        });

        // Observar elementos específicos
        const scrollElements = document.querySelectorAll(SELECTORS.scrollElements);
        scrollElements.forEach(element => {
            this.observer.observe(element);
        });
    }

    /**
     * Anima un elemento
     * @param {Element} element - Elemento a animar
     */
    animateElement(element) {
        element.classList.add('animated');
    }

    /**
     * Destruye el observer
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// ===================================
// GESTOR DE SERVICIOS (TARJETAS)
// ===================================

class ServicesManager {
    constructor() {
        this.serviceCards = document.querySelectorAll(SELECTORS.serviceCards);
        this.touchStartY = 0;
        this.touchEndY = 0;
    }

    /**
     * Inicializa el services manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Vincula eventos de las tarjetas de servicio
     */
    bindEvents() {
        this.serviceCards.forEach(card => {
            // Eventos de mouse
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
            card.addEventListener('click', () => this.handleCardClick(card));

            // Eventos de touch para móviles
            card.addEventListener('touchstart', (e) => this.handleTouchStart(e, card));
            card.addEventListener('touchend', (e) => this.handleTouchEnd(e, card));

            // Eventos de teclado para accesibilidad
            card.addEventListener('keydown', (e) => this.handleKeyDown(e, card));
            
            // Hacer las tarjetas focusables
            card.setAttribute('tabindex', '0');
        });
    }

    /**
     * Maneja el hover en tarjetas
     * @param {Element} card - Tarjeta de servicio
     */
    handleCardHover(card) {
        card.classList.add('hovered');
    }

    /**
     * Maneja cuando se deja de hacer hover
     * @param {Element} card - Tarjeta de servicio
     */
    handleCardLeave(card) {
        card.classList.remove('hovered');
    }

    /**
     * Maneja el click en tarjetas
     * @param {Element} card - Tarjeta de servicio
     */
    handleCardClick(card) {
        const cardInner = card.querySelector('.card-inner');
        if (cardInner) {
            card.classList.toggle('flipped');
        }
    }

    /**
     * Maneja el inicio del touch
     * @param {Event} e - Evento touch
     * @param {Element} card - Tarjeta de servicio
     */
    handleTouchStart(e, card) {
        this.touchStartY = e.touches[0].clientY;
    }

    /**
     * Maneja el fin del touch
     * @param {Event} e - Evento touch
     * @param {Element} card - Tarjeta de servicio
     */
    handleTouchEnd(e, card) {
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Si no fue un scroll, flip la tarjeta
        if (Math.abs(this.touchStartY - this.touchEndY) < 10) {
            this.handleCardClick(card);
        }
    }

    /**
     * Maneja eventos de teclado para accesibilidad
     * @param {Event} e - Evento de teclado
     * @param {Element} card - Tarjeta de servicio
     */
    handleKeyDown(e, card) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleCardClick(card);
        }
    }
}

// ===================================
// GESTOR DE FORMULARIOS
// ===================================

class FormManager {
    constructor() {
        this.contactForm = document.querySelector(SELECTORS.contactForm);
        this.isSubmitting = false;
    }

    /**
     * Inicializa el form manager
     */
    init() {
        if (this.contactForm) {
            this.bindEvents();
            this.setupValidation();
        }
    }

    /**
     * Vincula eventos del formulario
     */
    bindEvents() {
        this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validación en tiempo real
        const inputs = this.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Configura la validación del formulario
     */
    setupValidation() {
        const emailInput = this.contactForm.querySelector('#email');
        const phoneInput = this.contactForm.querySelector('#telefono');
        
        if (emailInput) {
            emailInput.setAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
        }
        
        if (phoneInput) {
            phoneInput.setAttribute('pattern', '[0-9\\s\\(\\)\\+\\-]{10,}');
        }
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento de submit
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = new FormData(this.contactForm);
        const data = Object.fromEntries(formData);
        
        // Validar formulario
        if (!this.validateForm(data)) {
            this.showError('Por favor, completa todos los campos obligatorios correctamente.');
            return;
        }
        
        this.isSubmitting = true;
        this.showLoadingState();
        
        try {
            // Simular envío (aquí conectarías con tu backend)
            await this.submitForm(data);
            this.showSuccess('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
            this.resetForm();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.showError('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    /**
     * Valida todo el formulario
     * @param {Object} data - Datos del formulario
     * @returns {boolean} - Si es válido
     */
    validateForm(data) {
        let isValid = true;
        
        // Campos obligatorios
        const requiredFields = ['nombre', 'email', 'mensaje'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                this.showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
            }
        });
        
        // Validar email
        if (data.email && !this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Por favor, ingresa un email válido');
            isValid = false;
        }
        
        // Validar teléfono si se proporciona
        if (data.telefono && !this.isValidPhone(data.telefono)) {
            this.showFieldError('telefono', 'Por favor, ingresa un teléfono válido');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Valida un campo específico
     * @param {Element} field - Campo a validar
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Limpiar errores previos
        this.clearFieldError(field);
        
        // Validar según el tipo de campo
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(fieldName, 'Este campo es obligatorio');
            return false;
        }
        
        if (fieldName === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(fieldName, 'Por favor, ingresa un email válido');
            return false;
        }
        
        if (fieldName === 'telefono' && value && !this.isValidPhone(value)) {
            this.showFieldError(fieldName, 'Por favor, ingresa un teléfono válido');
            return false;
        }
        
        return true;
    }

    /**
     * Muestra error en un campo específico
     * @param {string} fieldName - Nombre del campo
     * @param {string} message - Mensaje de error
     */
    showFieldError(fieldName, message) {
        const field = this.contactForm.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            // Remover mensaje de error previo
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Agregar nuevo mensaje de error
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            errorElement.style.color = '#CC0000';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            
            field.parentNode.appendChild(errorElement);
        }
    }

    /**
     * Limpia el error de un campo
     * @param {Element} field - Campo a limpiar
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} - Si es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida formato de teléfono
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} - Si es válido
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Simula el envío del formulario
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa del envío
     */
    async submitForm(data) {
        // Simular delay de red
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Aquí harías la llamada real a tu API
                console.log('Datos del formulario:', data);
                resolve();
            }, 1500);
        });
    }

    /**
     * Muestra estado de carga en el formulario
     */
    showLoadingState() {
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
            `;
        }
    }

    /**
     * Oculta estado de carga en el formulario
     */
    hideLoadingState() {
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Enviar Mensaje';
        }
    }

    /**
     * Muestra mensaje de éxito
     * @param {string} message - Mensaje a mostrar
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje a mostrar
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Muestra notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success/error)
     */
    showNotification(message, type) {
        // Remover notificación existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#99CC33' : '#CC0000'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        this.contactForm.reset();
        
        // Limpiar errores
        const errorMessages = this.contactForm.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const errorFields = this.contactForm.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
}

// ===================================
// GESTOR DE SCROLL
// ===================================

class ScrollManager {
    constructor() {
        this.backToTopBtn = document.querySelector(SELECTORS.backToTop);
        this.scrollThreshold = 300;
    }

    /**
     * Inicializa el scroll manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Vincula eventos de scroll
     */
    bindEvents() {
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 16));
        
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => this.scrollToTop());
        }
    }

    /**
     * Maneja el scroll de la página
     */
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Mostrar/ocultar botón back to top
        if (this.backToTopBtn) {
            if (scrollY > this.scrollThreshold) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }
    }

    /**
     * Scroll suave al inicio de la página
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ===================================
// GESTOR PRINCIPAL DE LA APLICACIÓN
// ===================================

class App {
    constructor() {
        this.loadingManager = new LoadingManager();
        this.navigationManager = new NavigationManager();
        this.animationManager = new AnimationManager();
        this.servicesManager = new ServicesManager();
        this.formManager = new FormManager();
        this.scrollManager = new ScrollManager();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        // Verificar que el DOM esté cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    /**
     * Inicia todos los managers
     */
    start() {
        try {
            this.loadingManager.init();
            this.navigationManager.init();
            this.animationManager.init();
            this.servicesManager.init();
            this.formManager.init();
            this.scrollManager.init();
            
            console.log('🚀 Divergen-T App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }

    /**
     * Destruye la aplicación y limpia eventos
     */
    destroy() {
        if (this.animationManager) {
            this.animationManager.destroy();
        }
        
        console.log('🔄 Divergen-T App destroyed');
    }
}

// ===================================
// ESTILOS DINÁMICOS PARA ANIMACIONES
// ===================================

// Agregar estilos CSS para animaciones de loading y notificaciones
const dynamicStyles = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    .notification {
        animation: slideInFromRight 0.3s ease-out;
    }
    
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .service-card.flipped .card-inner {
        transform: rotateY(180deg);
    }
    
    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
        border-color: #CC0000;
        box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
    }
`;

// Agregar estilos al head
const styleElement = document.createElement('style');
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);

// ===================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===================================

// Crear instancia global de la aplicación
window.divergentApp = new App();

// Inicializar la aplicación
window.divergentApp.init();

// Limpieza en unload
window.addEventListener('beforeunload', () => {
    if (window.divergentApp) {
        window.divergentApp.destroy();
    }
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

// ===================================
// EXPORTS PARA MODULARIDAD
// ===================================

// Si usas módulos ES6, puedes exportar las clases
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        App,
        LoadingManager,
        NavigationManager,
        AnimationManager,
        ServicesManager,
        FormManager,
        ScrollManager,
        Utils
    };
}
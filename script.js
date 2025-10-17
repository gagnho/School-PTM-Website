// ===================================
// Global State Management
// ===================================
const AppState = {
    currentSection: 'home',
    locationActive: false,
    voiceActive: false,
    voiceRecognition: null,
    voiceSynthesis: window.speechSynthesis,
    currentLocation: null,
    projects: [],
    selectedProject: null,
    scene: null,
    camera: null,
    renderer: null,
    animationId: null
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    navLinks: document.querySelectorAll('.nav-link'),
    contentSections: document.querySelectorAll('.content-section'),
    checkInBtn: document.getElementById('check-in-btn'),
    locationStatus: document.getElementById('location-status'),
    userLocation: document.getElementById('user-location'),
    voiceToggleBtn: document.getElementById('voice-toggle-btn'),
    voiceAssistant: document.getElementById('voice-assistant'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    toggleSidebar: document.getElementById('toggle-sidebar'),
    pageTitle: document.getElementById('page-title'),
    voiceMicBtn: document.getElementById('voice-mic-btn'),
    voiceStopBtn: document.getElementById('voice-stop-btn'),
    voiceCloseBtn: document.getElementById('voice-close-btn'),
    userTranscript: document.getElementById('user-transcript'),
    assistantResponse: document.getElementById('assistant-response'),
    voiceStatusText: document.getElementById('voice-status-text')
};

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadProjects();
    checkLocationPermission();
    initialize3DScene();
    initializeVoiceRecognition();
});

function initializeApp() {
    console.log('🚀 Virtual Exhibition Guide Initialized');
    showNotification('Welcome to the Virtual Exhibition!', 'info');
    
    // Hide loading overlay after a short delay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 1000);
}

// ================================
// Sidebar Toggle Function (Fixed)
// ================================
function handleSidebarToggle() {
    elements.sidebar.classList.toggle('active');
    elements.mainContent.classList.toggle('expanded');
    document.body.classList.toggle('sidebar-open');

    // Resize 3D canvas after sidebar animation (applies site-wide)
    setTimeout(() => {
        onWindowResize?.();
    }, 350);
}

// ================================
// Event Listeners Setup (Fixed)
// ================================
function setupEventListeners() {
    // Sidebar navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    // Mobile menu toggle (hamburger icon)
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', handleSidebarToggle);
    }

    // Desktop toggle button (in sidebar header)
    if (elements.toggleSidebar) {
        elements.toggleSidebar.addEventListener('click', handleSidebarToggle);
    }

    // Check-in button
    if (elements.checkInBtn) {
        elements.checkInBtn.addEventListener('click', handleCheckIn);
    }

    // Voice assistant toggle
    if (elements.voiceToggleBtn) {
        elements.voiceToggleBtn.addEventListener('click', toggleVoiceAssistant);
    }

    // Voice assistant controls
    if (elements.voiceCloseBtn) {
        elements.voiceCloseBtn.addEventListener('click', closeVoiceAssistant);
    }

    if (elements.voiceMicBtn) {
        elements.voiceMicBtn.addEventListener('click', startVoiceRecognition);
    }

    if (elements.voiceStopBtn) {
        elements.voiceStopBtn.addEventListener('click', stopVoiceRecognition);
    }

    // 3D Map controls
    const resetCameraBtn = document.getElementById('reset-camera');
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', resetCamera);
    }

    const toggleLabelsBtn = document.getElementById('toggle-labels');
    if (toggleLabelsBtn) {
        toggleLabelsBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            showNotification(this.classList.contains('active') ? 'Labels shown' : 'Labels hidden', 'info');
        });
    }

    const myLocationBtn = document.getElementById('my-location');
    if (myLocationBtn) {
        myLocationBtn.addEventListener('click', () => {
            if (AppState.locationActive) {
                showNotification('Centered on your location', 'info');
                resetCamera();
            } else {
                showNotification('Please check in first', 'error');
            }
        });
    }

    const calculateRouteBtn = document.getElementById('calculate-route');
    if (calculateRouteBtn) {
        calculateRouteBtn.addEventListener('click', calculateRoute);
    }

    // Close modal on background click
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Handle window resize for 3D scene
    window.addEventListener('resize', onWindowResize);
}


// ===================================
// Navigation System
// ===================================
function navigateToSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.parentElement.classList.add('active');
    }

    // Show selected section
    elements.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        updatePageTitle(sectionId);
    }

    AppState.currentSection = sectionId;

    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePageTitle(sectionId) {
    const titles = {
        'home': 'Welcome to School Exhibition 2025',
        'projects': 'Exhibition Projects',
        '3d-map': 'Interactive 3D Map',
        'fun-games': 'Fun Games & Activities',
        'about': 'About This Exhibition'
    };
    
    elements.pageTitle.textContent = titles[sectionId] || 'Exhibition Guide';
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    elements.mainContent.classList.toggle('expanded');
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    const icon = toast.querySelector('i');
    
    // Update icon based on type
    const icons = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle'
    };
    
    icon.className = `fas ${icons[type] || icons.info}`;
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// Geolocation & Check-in
// ===================================
function checkLocationPermission() {
    if ('geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'granted') {
                console.log('✅ Location access granted');
            }
        }).catch(err => {
            console.log('Permission query not supported');
        });
    }
}

function handleCheckIn() {
    if (!AppState.locationActive) {
        requestLocation();
    } else {
        showNotification('Already checked in!', 'info');
    }
}

function requestLocation() {
    if ('geolocation' in navigator) {
        elements.checkInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Locating...</span>';
        
        navigator.geolocation.getCurrentPosition(
            handleLocationSuccess,
            handleLocationError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        showNotification('Geolocation not supported by your browser', 'error');
    }
}

function handleLocationSuccess(position) {
    AppState.locationActive = true;
    AppState.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
    };
    
    elements.checkInBtn.style.display = 'none';
    elements.locationStatus.classList.remove('hidden');
    elements.userLocation.innerHTML = '<i class="fas fa-location-arrow"></i> <span>Location: Main Hall</span>';
    
    showNotification('Successfully checked in! 📍', 'success');
    
    // Start tracking location
    startLocationTracking();
}

function handleLocationError(error) {
    console.error('Location error:', error);
    elements.checkInBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Check In</span>';
    
    const errorMessages = {
        1: 'Location access denied. Please enable location permissions.',
        2: 'Location unavailable. Please check your device settings.',
        3: 'Location request timed out. Please try again.'
    };
    
    showNotification(errorMessages[error.code] || 'Unable to access location', 'error');
}

function startLocationTracking() {
    if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                AppState.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                updateLocationDisplay();
            },
            (error) => console.error('Tracking error:', error),
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );
        
        AppState.locationWatchId = watchId;
    }
}

function updateLocationDisplay() {
    // Simulate area detection
    const areas = ['Main Hall', 'Science Wing', 'Arts Section', 'Tech Lab', 'Exhibition Hall A', 'Exhibition Hall B'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    elements.userLocation.innerHTML = `<i class="fas fa-location-arrow"></i> <span>Location: ${randomArea}</span>`;
}

// ===================================
// Projects Management
// ===================================
function loadProjects() {
    AppState.projects = [
        {
            id: 1,
            title: 'Solar Energy System',
            location: 'A-12',
            category: 'science',
            description: 'An innovative solar panel system demonstrating renewable energy solutions for sustainable future',
            team: 'Team Alpha',
            details: 'This project showcases an advanced solar energy harvesting system with smart tracking capabilities. The system uses photovoltaic cells combined with IoT sensors to optimize energy collection throughout the day.'
        },
        {
            id: 2,
            title: 'AI Chatbot Assistant',
            location: 'C-08',
            category: 'technology',
            description: 'Machine learning powered chatbot for customer service automation and natural language processing',
            team: 'Tech Innovators',
            details: 'An intelligent conversational AI built using natural language processing and deep learning. The chatbot can understand context, maintain conversation history, and provide personalized responses.'
        },
        {
            id: 3,
            title: 'Robotics Arm',
            location: 'B-05',
            category: 'engineering',
            description: 'Precision robotic arm with 6 degrees of freedom for industrial automation applications',
            team: 'Robo Squad',
            details: 'A highly precise robotic arm designed for pick-and-place operations, assembly tasks, and quality inspection. Features include force feedback, vision guidance, and programmable motion paths.'
        },
        {
            id: 4,
            title: 'Digital Art Installation',
            location: 'D-15',
            category: 'arts',
            description: 'Interactive digital art combining projection mapping and motion sensors for immersive experiences',
            team: 'Creative Minds',
            details: 'An immersive art installation that responds to visitor movements and gestures. Uses projection mapping technology to create dynamic visual experiences that blend physical and digital art.'
        },
        {
            id: 5,
            title: 'Mathematical Modeling',
            location: 'E-20',
            category: 'mathematics',
            description: 'Complex mathematical models for predicting climate change patterns and environmental analysis',
            team: 'Math Wizards',
            details: 'Advanced computational models using differential equations and statistical analysis to predict climate trends. Includes visualizations of temperature changes, sea level rise, and carbon emissions.'
        },
        {
            id: 6,
            title: 'Water Purification System',
            location: 'A-18',
            category: 'science',
            description: 'Low-cost water purification using natural filtration methods and sustainable materials',
            team: 'Eco Warriors',
            details: 'A sustainable water purification system using bio-sand filters, activated carbon, and UV sterilization. Designed for communities with limited access to clean water.'
        }
    ];

    renderProjects();
    setupProjectFilters();
}

function renderProjects(projects = AppState.projects) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    const categoryEmojis = {
        'science': '🔬',
        'technology': '💻',
        'engineering': '⚙️',
        'arts': '🎨',
        'mathematics': '📐'
    };

    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-image">
                ${categoryEmojis[project.category] || '📚'}
                <span class="project-badge">${project.category}</span>
            </div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p class="project-location">
                    <i class="fas fa-map-pin"></i> Stall ${project.location}
                </p>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span class="project-creators">
                        <i class="fas fa-users"></i> ${project.team}
                    </span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-small btn-primary" onclick="showProjectDetails(${project.id})">View Details</button>
                    <button class="btn btn-small btn-outline" onclick="navigateToStall('${project.location}')">
                        <i class="fas fa-directions"></i> Navigate
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupProjectFilters() {
    const searchInput = document.getElementById('project-search');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProjects);
    }
}

function filterProjects() {
    const searchTerm = document.getElementById('project-search')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || 'all';

    const filtered = AppState.projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm) ||
                            project.description.toLowerCase().includes(searchTerm) ||
                            project.team.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || project.category === category;
        
        return matchesSearch && matchesCategory;
    });

    renderProjects(filtered);
    
    if (filtered.length === 0) {
        document.getElementById('projects-grid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 64px; color: rgba(255,255,255,0.3); margin-bottom: 20px;"></i>
                <h3 style="color: white; margin-bottom: 10px;">No projects found</h3>
                <p style="color: rgba(255,255,255,0.7);">Try adjusting your search or filter criteria</p>
            </div>
        `;
    }
}

function showProjectDetails(projectId) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-project-title');
    const modalContent = document.getElementById('modal-project-content');

    const categoryEmojis = {
        'science': '🔬',
        'technology': '💻',
        'engineering': '⚙️',
        'arts': '🎨',
        'mathematics': '📐'
    };

    modalTitle.textContent = project.title;
    modalContent.innerHTML = `
        <div style="font-size: 80px; text-align: center; padding: 40px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 15px; margin-bottom: 30px;">
            ${categoryEmojis[project.category] || '📚'}
        </div>
        <p style="font-size: 16px; color: var(--text-gray); line-height: 1.8; margin-bottom: 20px;">
            ${project.description}
        </p>
        <p style="font-size: 15px; color: var(--text-gray); line-height: 1.8; margin-bottom: 30px; padding: 20px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
            ${project.details}
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="padding: 20px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
                <strong style="color: var(--text-dark); display: block; margin-bottom: 8px;">📍 Location</strong>
                <p style="color: var(--text-gray); margin: 0;">Stall ${project.location}</p>
            </div>
            <div style="padding: 20px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
                <strong style="color: var(--text-dark); display: block; margin-bottom: 8px;">🏷️ Category</strong>
                <p style="color: var(--text-gray); margin: 0; text-transform: capitalize;">${project.category}</p>
            </div>
            <div style="padding: 20px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
                <strong style="color: var(--text-dark); display: block; margin-bottom: 8px;">👥 Team</strong>
                <p style="color: var(--text-gray); margin: 0;">${project.team}</p>
            </div>
            <div style="padding: 20px; background: rgba(74, 144, 226, 0.05); border-radius: 10px;">
                <strong style="color: var(--text-dark); display: block; margin-bottom: 8px;">⭐ Rating</strong>
                <p style="color: var(--text-gray); margin: 0;">4.8/5.0 (${Math.floor(Math.random() * 50) + 20} reviews)</p>
            </div>
        </div>
        <button class="btn btn-primary w-100" onclick="navigateToStall('${project.location}'); closeModal();">
            <i class="fas fa-directions"></i> Get Directions to This Project
        </button>
    `;

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
}

function navigateToStall(stallId) {
    navigateToSection('3d-map');
    setTimeout(() => {
        const destinationSelect = document.getElementById('destination-select');
        if (destinationSelect) {
            const options = destinationSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === stallId) {
                    destinationSelect.selectedIndex = i;
                    break;
                }
            }
            calculateRoute();
        }
        showNotification(`Navigating to Stall ${stallId} 🧭`, 'info');
    }, 500);
}

// ===================================
// 3D Map & Navigation
// ===================================
function initialize3DScene() {
    const canvas = document.getElementById('3d-canvas');
    if (!canvas) return;

    const container = document.getElementById('3d-model-viewer');
    
    // Scene setup
    AppState.scene = new THREE.Scene();
    AppState.scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup
    AppState.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    AppState.camera.position.set(0, 10, 20);
    AppState.camera.lookAt(0, 0, 0);
    
    // Renderer setup
    AppState.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    AppState.renderer.setSize(container.clientWidth, container.clientHeight);
    AppState.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    AppState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    AppState.scene.add(directionalLight);
    
    // Create exhibition hall
    createExhibitionHall();
    
    // Hide loading overlay
    setTimeout(() => {
        const loading3D = document.getElementById('loading-3d');
        if (loading3D) {
            loading3D.classList.add('hidden');
        }
    }, 1500);
    
    // Start animation
    animate3D();
}

function createExhibitionHall() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    AppState.scene.add(floor);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0xdddddd);
    AppState.scene.add(gridHelper);
    
    // Create stall markers
    const stalls = [
        { name: 'A-12', pos: [-8, 1, -8], color: 0x4A90E2 },
        { name: 'B-05', pos: [8, 1, -8], color: 0x50C878 },
        { name: 'C-08', pos: [-8, 1, 8], color: 0xFF6B6B },
        { name: 'D-15', pos: [8, 1, 8], color: 0xFFD700 },
        { name: 'E-20', pos: [0, 1, -15], color: 0x9370DB },
        { name: 'A-18', pos: [0, 1, 15], color: 0xFF69B4 }
    ];
    
    stalls.forEach(stall => {
        const geometry = new THREE.BoxGeometry(3, 2, 3);
        const material = new THREE.MeshStandardMaterial({ color: stall.color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(stall.pos[0], stall.pos[1], stall.pos[2]);
        cube.userData = { name: stall.name };
        AppState.scene.add(cube);
        
        // Add a floating marker above each stall
        const markerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const markerMaterial = new THREE.MeshStandardMaterial({ 
            color: stall.color,
            emissive: stall.color,
            emissiveIntensity: 0.5
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(stall.pos[0], stall.pos[1] + 2, stall.pos[2]);
        AppState.scene.add(marker);
    });
}

function animate3D() {
    AppState.animationId = requestAnimationFrame(animate3D);
    
    // Rotate camera slowly
    if (AppState.camera) {
        const time = Date.now() * 0.0001;
        AppState.camera.position.x = Math.sin(time) * 20;
        AppState.camera.position.z = Math.cos(time) * 20;
        AppState.camera.lookAt(0, 0, 0);
    }
    
    if (AppState.renderer && AppState.scene && AppState.camera) {
        AppState.renderer.render(AppState.scene, AppState.camera);
    }
}

function resetCamera() {
    if (AppState.camera) {
        AppState.camera.position.set(0, 10, 20);
        AppState.camera.lookAt(0, 0, 0);
        showNotification('Camera view reset 🎥', 'info');
    }
}

function onWindowResize() {
    const container = document.getElementById('3d-model-viewer');
    if (!container || !AppState.camera || !AppState.renderer) return;
    
    AppState.camera.aspect = container.clientWidth / container.clientHeight;
    AppState.camera.updateProjectionMatrix();
    AppState.renderer.setSize(container.clientWidth, container.clientHeight);
}

function calculateRoute() {
    const destination = document.getElementById('destination-select')?.value;
    if (!destination) {
        showNotification('Please select a destination 📍', 'error');
        return;
    }

    if (!AppState.locationActive) {
        showNotification('Please check in first to use navigation 📱', 'error');
        return;
    }

    const routeInstructions = document.getElementById('route-instructions');
    const instructionList = document.getElementById('instruction-list');
    
    // Generate instructions based on destination
    const destinationNames = {
        'A-12': 'Solar Energy System',
        'B-05': 'Robotics Arm',
        'C-08': 'AI Chatbot',
        'D-15': 'Digital Art',
        'E-20': 'Math Models',
        'A-18': 'Water Purification',
        'entrance': 'Main Entrance',
        'food-court': 'Food Court',
        'restrooms': 'Restrooms'
    };
    
    const instructions = [
        `Starting from your current location`,
        `Head towards the main corridor`,
        `Turn right at the ${destinationNames[destination] || destination} sign`,
        `Walk straight for approximately 50 meters`,
        `You will see the ${destinationNames[destination] || destination} on your left`,
        `Arrive at ${destination}`
    ];

    instructionList.innerHTML = instructions.map(inst => `<li>${inst}</li>`).join('');
    routeInstructions.classList.remove('hidden');

    // Update distance and time
    const walkTime = Math.floor(Math.random() * 4) + 2;
    const distance = Math.floor(Math.random() * 150) + 50;
    
    document.getElementById('walk-time').textContent = `${walkTime} min`;
    document.getElementById('distance').textContent = `${distance}m`;

    showNotification('Route calculated successfully! 🗺️', 'success');
}

// ===================================
// Voice Assistant
// ===================================
function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        AppState.voiceRecognition = new SpeechRecognition();
        
        AppState.voiceRecognition.continuous = false;
        AppState.voiceRecognition.interimResults = false;
        AppState.voiceRecognition.lang = 'en-US';
        
        AppState.voiceRecognition.onstart = () => {
            elements.voiceStatusText.textContent = 'Listening...';
            elements.voiceMicBtn.classList.add('active');
            console.log('🎤 Voice recognition started');
        };
        
        AppState.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.userTranscript.textContent = transcript;
            processVoiceCommand(transcript);
        };
        
        AppState.voiceRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            elements.voiceStatusText.textContent = 'Error occurred. Please try again.';
            elements.voiceMicBtn.classList.remove('active');
            
            if (event.error === 'not-allowed') {
                showNotification('Microphone access denied. Please enable it in settings.', 'error');
            }
        };
        
        AppState.voiceRecognition.onend = () => {
            elements.voiceStatusText.textContent = 'Click microphone to speak';
            elements.voiceMicBtn.classList.remove('active');
            console.log('🎤 Voice recognition ended');
        };
        
        console.log('✅ Voice recognition initialized');
    } else {
        console.warn('❌ Speech recognition not supported');
        showNotification('Voice recognition not supported in this browser', 'error');
    }
}

function toggleVoiceAssistant() {
    elements.voiceAssistant.classList.toggle('active');
    AppState.voiceActive = elements.voiceAssistant.classList.contains('active');
    
    if (AppState.voiceActive) {
        elements.userTranscript.textContent = 'Click the microphone to start...';
        elements.assistantResponse.textContent = 'Ready to help you navigate!';
    }
}

function closeVoiceAssistant() {
    elements.voiceAssistant.classList.remove('active');
    AppState.voiceActive = false;
    stopVoiceRecognition();
}

function startVoiceRecognition() {
    if (!AppState.voiceRecognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    try {
        AppState.voiceRecognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
    }
}

function stopVoiceRecognition() {
    if (AppState.voiceRecognition) {
        AppState.voiceRecognition.stop();
        elements.voiceMicBtn.classList.remove('active');
    }
}

function processVoiceCommand(command) {
    const lowerCommand = command.toLowerCase();
    let response = '';
    
    // Navigate to sections
    if (lowerCommand.includes('home') || lowerCommand.includes('main page')) {
        navigateToSection('home');
        response = 'Navigating to home page';
    }
    else if (lowerCommand.includes('project')) {
        navigateToSection('projects');
        response = 'Showing all exhibition projects';
    }
    else if (lowerCommand.includes('map') || lowerCommand.includes('3d')) {
        navigateToSection('3d-map');
        response = 'Opening the 3D map';
    }
    else if (lowerCommand.includes('game')) {
        navigateToSection('fun-games');
        response = 'Opening games section';
    }
    else if (lowerCommand.includes('about')) {
        navigateToSection('about');
        response = 'Showing about information';
    }
    // Navigate to specific stalls
    else if (lowerCommand.includes('stall') || lowerCommand.includes('navigate to')) {
        const stallMatch = lowerCommand.match(/[a-e]-\d+/i);
        if (stallMatch) {
            navigateToStall(stallMatch[0].toUpperCase());
            response = `Navigating to stall ${stallMatch[0].toUpperCase()}`;
        } else {
            response = 'Please specify a stall number, like A-12';
        }
    }
    // Search projects
    else if (lowerCommand.includes('solar') || lowerCommand.includes('energy')) {
        navigateToStall('A-12');
        response = 'Showing Solar Energy System project';
    }
    else if (lowerCommand.includes('robot')) {
        navigateToStall('B-05');
        response = 'Showing Robotics Arm project';
    }
    else if (lowerCommand.includes('ai') || lowerCommand.includes('chatbot')) {
        navigateToStall('C-08');
        response = 'Showing AI Chatbot project';
    }
    // Start games
    else if (lowerCommand.includes('quiz')) {
        navigateToSection('fun-games');
        setTimeout(() => startGame('quiz'), 500);
        response = 'Starting exhibition quiz';
    }
    // Location info
    else if (lowerCommand.includes('where am i') || lowerCommand.includes('location')) {
        response = AppState.locationActive 
            ? 'You are currently in the main exhibition hall' 
            : 'Please check in to enable location tracking';
    }
    else {
        response = 'I can help you navigate the exhibition, find projects, or start games. Try saying "show me projects" or "navigate to stall A-12"';
    }
    
    elements.assistantResponse.textContent = response;
    speakResponse(response);
    showNotification(response, 'info');
}

function speakResponse(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }
}

function processSuggestion(text) {
    elements.userTranscript.textContent = text;
    processVoiceCommand(text);
}

// ===================================
// Games System
// ===================================
function startGame(gameType) {
    const gameContainer = document.getElementById('game-container');
    const gameTitle = document.getElementById('game-title');
    const gameContent = document.getElementById('game-content');

    const games = {
        'quiz': {
            title: 'Exhibition Quiz 🎯',
            content: generateQuizGame()
        },
        'memory': {
            title: 'Memory Match Game 🧠',
            content: generateMemoryGame()
        },
        'scavenger': {
            title: 'Scavenger Hunt 🔍',
            content: generateScavengerHunt()
        }
    };

    const game = games[gameType];
    if (game) {
        gameTitle.textContent = game.title;
        gameContent.innerHTML = game.content;
        gameContainer.classList.remove('hidden');
        showNotification(`${game.title} started! 🎮`, 'success');
        gameContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function generateQuizGame() {
    const questions = [
        {
            question: 'Which project focuses on renewable energy?',
            options: ['Solar Energy System', 'AI Chatbot', 'Robotics Arm', 'Digital Art'],
            correct: 0
        },
        {
            question: 'What technology is used in the AI Chatbot?',
            options: ['Solar Panels', 'Machine Learning', 'Hydraulics', 'Projection Mapping'],
            correct: 1
        },
        {
            question: 'How many degrees of freedom does the Robotics Arm have?',
            options: ['3', '4', '6', '8'],
            correct: 2
        }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    
    return `
        <div class="quiz-game" id="quiz-container">
            <div class="quiz-progress" style="background: rgba(74, 144, 226, 0.1); height: 8px; border-radius: 10px; margin-bottom: 30px;">
                <div id="quiz-progress-bar" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); height: 100%; width: 33%; border-radius: 10px; transition: width 0.3s;"></div>
            </div>
            <div id="quiz-question-container">
                <h3 style="color: var(--primary-color); margin-bottom: 10px;">Question 1 of ${questions.length}</h3>
                <p style="font-size: 20px; margin-bottom: 30px; color: var(--text-dark);">${questions[0].question}</p>
                <div class="quiz-options" style="display: grid; gap: 15px;">
                    ${questions[0].options.map((opt, idx) => `
                        <button class="quiz-option" onclick="checkQuizAnswer(${idx}, ${questions[0].correct})" 
                                style="padding: 15px 20px; background: rgba(74, 144, 226, 0.1); border: 2px solid transparent; 
                                border-radius: 10px; cursor: pointer; transition: all 0.3s; font-size: 16px; text-align: left;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="quiz-score" style="margin-top: 30px; font-size: 18px; font-weight: 600; text-align: center;">
                Score: <span id="quiz-score">0</span> / ${questions.length * 10}
            </div>
        </div>
    `;
}

function checkQuizAnswer(selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, idx) => {
        opt.style.pointerEvents = 'none';
        if (idx === correct) {
            opt.style.background = 'rgba(80, 200, 120, 0.2)';
            opt.style.borderColor = 'var(--secondary-color)';
        } else if (idx === selected && selected !== correct) {
            opt.style.background = 'rgba(255, 107, 107, 0.2)';
            opt.style.borderColor = 'var(--accent-color)';
        }
    });
    
    if (selected === correct) {
        const scoreEl = document.getElementById('quiz-score');
        scoreEl.textContent = parseInt(scoreEl.textContent) + 10;
        showNotification('Correct! Well done! 🎉', 'success');
    } else {
        showNotification('Not quite. Try the next one! 💪', 'info');
    }
    
    setTimeout(() => {
        showNotification('Quiz completed! Great job! 🏆', 'success');
    }, 2000);
}

function generateMemoryGame() {
    const icons = ['🔬', '💻', '⚙️', '🎨', '📐', '💡'];
    const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    
    return `
        <div class="memory-game">
            <div class="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                ${cards.map((icon, i) => `
                    <div class="memory-card" onclick="flipMemoryCard(this, '${icon}')" data-icon="${icon}"
                         style="aspect-ratio: 1; background: var(--primary-color); border-radius: 10px; display: flex; 
                         align-items: center; justify-content: center; font-size: 32px; cursor: pointer; transition: all 0.3s;">
                        <div class="card-front">❓</div>
                    </div>
                `).join('')}
            </div>
            <div class="memory-stats" style="display: flex; justify-content: space-around; padding: 20px; 
                 background: rgba(74, 144, 226, 0.1); border-radius: 10px; font-size: 16px;">
                <span>Moves: <strong id="move-count">0</strong></span>
                <span>Matches: <strong id="match-count">0/6</strong></span>
            </div>
        </div>
    `;
}

let memoryFlipped = [];
let memoryMoves = 0;
let memoryMatches = 0;

function flipMemoryCard(card, icon) {
    if (memoryFlipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    card.style.background = 'var(--secondary-color)';
    card.querySelector('.card-front').textContent = icon;
    memoryFlipped.push(card);
    
    if (memoryFlipped.length === 2) {
        memoryMoves++;
        document.getElementById('move-count').textContent = memoryMoves;
        
        const icon1 = memoryFlipped[0].dataset.icon;
        const icon2 = memoryFlipped[1].dataset.icon;
        
        if (icon1 === icon2) {
            memoryFlipped.forEach(c => {
                c.classList.add('matched');
                c.style.background = 'rgba(80, 200, 120, 0.5)';
                c.style.pointerEvents = 'none';
            });
            memoryFlipped = [];
            memoryMatches++;
            document.getElementById('match-count').textContent = `${memoryMatches}/6`;
            
            if (memoryMatches === 6) {
                setTimeout(() => {
                    showNotification(`Congratulations! You won in ${memoryMoves} moves! 🎉`, 'success');
                }, 500);
            }
        } else {
            setTimeout(() => {
                memoryFlipped.forEach(c => {
                    c.classList.remove('flipped');
                    c.style.background = 'var(--primary-color)';
                    c.querySelector('.card-front').textContent = '❓';
                });
                memoryFlipped = [];
            }, 1000);
        }
    }
}

function generateScavengerHunt() {
    return `
        <div class="scavenger-hunt">
            <div class="hunt-objective" style="padding: 25px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); 
                 color: white; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">📍 Current Objective:</h3>
                <p style="font-size: 20px; margin-bottom: 15px;">Find all the exhibition projects!</p>
                <div class="hunt-hint" style="padding: 15px; background: rgba(255, 255, 255, 0.2); border-radius: 10px; margin-top: 15px;">
                    <strong>💡 Hint:</strong> Look for projects in different categories
                </div>
            </div>
            <div class="hunt-checklist" style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px; color: var(--text-dark);">Items Found: <span id="hunt-count">0</span>/6</h4>
                <ul style="list-style: none;">
                    ${['Solar Energy Project 🔬', 'Robotics Display ⚙️', 'AI Demonstration 💻', 
                       'Art Installation 🎨', 'Math Models 📐', 'Water Purification 💧'].map((item, i) => `
                        <li class="hunt-item" style="padding: 15px; margin-bottom: 10px; background: rgba(74, 144, 226, 0.05); 
                             border-radius: 10px; display: flex; align-items: center; gap: 15px;">
                            <input type="checkbox" id="item${i+1}" onchange="updateHuntCount()" 
                                   style="width: 20px; height: 20px; cursor: pointer;">
                            <label for="item${i+1}" style="cursor: pointer; font-size: 16px;">${item}</label>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <button class="btn btn-primary w-100" onclick="submitScavengerHunt()">🏆 Submit Hunt</button>
        </div>
    `;
}

function updateHuntCount() {
    const checked = document.querySelectorAll('.hunt-item input:checked').length;
    document.getElementById('hunt-count').textContent = checked;
    
    if (checked === 6) {
        showNotification('All items found! Click submit to complete! 🎉', 'success');
    }
}

function submitScavengerHunt() {
    const checked = document.querySelectorAll('.hunt-item input:checked').length;
    if (checked === 6) {
        showNotification('🏆 Congratulations! You found all items!', 'success');
    } else {
        showNotification(`You found ${checked} out of 6 items. Keep exploring! 🔍`, 'info');
    }
}

function closeGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('hidden');
    
    // Reset game states
    memoryFlipped = [];
    memoryMoves = 0;
    memoryMatches = 0;
}

function showLeaderboard() {
    showNotification('Leaderboard feature coming soon! 🏆', 'info');
}

// ===================================
// Utility Functions
// ===================================
console.log('%c🎓 Virtual Exhibition Guide Loaded Successfully! ', 'background: #4A90E2; color: white; padding: 10px; border-radius: 5px; font-size: 16px; font-weight: bold;');
console.log('%cEnjoy exploring the exhibition! 🚀', 'color: #50C878; font-size: 14px;');


document.getElementById('check-in-btn-home')?.addEventListener('click', handleCheckIn);

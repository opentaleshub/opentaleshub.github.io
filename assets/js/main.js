// Open Tales Hub - Main JavaScript
console.log('Open Tales Hub loaded');

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeTheme();
    initializeFontSize();
    initializeReadingProgress();
    initializeSmoothScrolling();
    initializeStoryCards();
    
    // Show loading animation
    showLoadingAnimation();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('opentales-theme') || 'dark';
    const themeToggle = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.innerHTML = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        if (themeToggle) themeToggle.innerHTML = '🌙';
    }
    
    // Setup theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('opentales-theme', 'light');
        if (themeToggle) themeToggle.innerHTML = '☀️';
    } else {
        localStorage.setItem('opentales-theme', 'dark');
        if (themeToggle) themeToggle.innerHTML = '🌙';
    }
}

// Font Size Management
function initializeFontSize() {
    const savedSize = localStorage.getItem('opentales-fontsize') || '16';
    document.body.style.fontSize = savedSize + 'px';
    
    // Setup font controls
    const increaseBtn = document.getElementById('font-increase');
    const decreaseBtn = document.getElementById('font-decrease');
    const resetBtn = document.getElementById('font-reset');
    
    if (increaseBtn) increaseBtn.addEventListener('click', increaseFont);
    if (decreaseBtn) decreaseBtn.addEventListener('click', decreaseFont);
    if (resetBtn) resetBtn.addEventListener('click', resetFont);
}

function increaseFont() {
    let currentSize = parseInt(getComputedStyle(document.body).fontSize);
    if (currentSize < 24) {
        currentSize += 2;
        document.body.style.fontSize = currentSize + 'px';
        localStorage.setItem('opentales-fontsize', currentSize);
    }
}

function decreaseFont() {
    let currentSize = parseInt(getComputedStyle(document.body).fontSize);
    if (currentSize > 12) {
        currentSize -= 2;
        document.body.style.fontSize = currentSize + 'px';
        localStorage.setItem('opentales-fontsize', currentSize);
    }
}

function resetFont() {
    document.body.style.fontSize = '16px';
    localStorage.setItem('opentales-fontsize', '16');
}

// Reading Progress
function initializeReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.id = 'reading-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', updateReadingProgress);
}

function updateReadingProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Story Cards Interaction
function initializeStoryCards() {
    const storyCards = document.querySelectorAll('.story-card');
    
    storyCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const link = this.querySelector('a');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
        
        // Add keyboard navigation
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = this.querySelector('a');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
    });
}

// Loading Animation
function showLoadingAnimation() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        setTimeout(() => {
            loadingEl.style.opacity = '0';
            setTimeout(() => {
                loadingEl.style.display = 'none';
            }, 300);
        }, 500);
    }
}

// Save Reading Position
function saveReadingPosition() {
    if (window.location.pathname.includes('/stories/')) {
        const position = window.scrollY;
        const storyId = window.location.pathname.split('/').pop();
        localStorage.setItem(`reading-${storyId}`, position);
    }
}

// Load Reading Position
function loadReadingPosition() {
    if (window.location.pathname.includes('/stories/')) {
        const storyId = window.location.pathname.split('/').pop();
        const position = localStorage.getItem(`reading-${storyId}`);
        if (position) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(position));
            }, 100);
        }
    }
}

// Initialize when page loads
window.addEventListener('load', loadReadingPosition);
window.addEventListener('scroll', saveReadingPosition);

// Export for use in other files
window.OpenTalesHub = {
    toggleTheme,
    increaseFont,
    decreaseFont,
    resetFont,
    saveReadingPosition,
    loadReadingPosition
};

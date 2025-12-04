// story.js - Reusable story page functionality

class StoryPage {
    constructor() {
        this.init();
    }
    
    init() {
        this.initTheme();
        this.initProgressBar();
        this.initFontControls();
        this.initKeyboardShortcuts();
        this.initSmoothLoad();
    }
    
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');
        
        if (themeToggle && themeIcon) {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            
            // Setup toggle
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            });
        }
    }
    
    initProgressBar() {
        const progressBar = document.getElementById('progressBar');
        
        if (progressBar) {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                progressBar.style.width = scrolled + '%';
            });
        }
    }
    
    initFontControls() {
        const storyContent = document.querySelector('.story-content');
        const fontIncrease = document.getElementById('fontIncrease');
        const fontDecrease = document.getElementById('fontDecrease');
        
        if (storyContent && fontIncrease && fontDecrease) {
            let fontSize = 18; // Base font size in pixels
            
            // Load saved font size
            const savedFontSize = localStorage.getItem('storyFontSize');
            if (savedFontSize) {
                fontSize = parseInt(savedFontSize);
                storyContent.style.fontSize = fontSize + 'px';
            }
            
            fontIncrease.addEventListener('click', () => {
                if (fontSize < 24) {
                    fontSize += 1;
                    storyContent.style.fontSize = fontSize + 'px';
                    localStorage.setItem('storyFontSize', fontSize);
                }
            });
            
            fontDecrease.addEventListener('click', () => {
                if (fontSize > 14) {
                    fontSize -= 1;
                    storyContent.style.fontSize = fontSize + 'px';
                    localStorage.setItem('storyFontSize', fontSize);
                }
            });
        }
    }
    
    initScrollToTop() {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + + to increase font
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                document.getElementById('fontIncrease')?.click();
            }
            
            // Ctrl/Cmd + - to decrease font
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                document.getElementById('fontDecrease')?.click();
            }
            
            // Escape to toggle theme
            if (e.key === 'Escape') {
                document.getElementById('themeToggle')?.click();
            }
            
            // Space bar to scroll down (when not in input)
            if (e.key === ' ' && !e.target.matches('input, textarea, button')) {
                e.preventDefault();
                window.scrollBy(0, window.innerHeight * 0.8);
            }
        });
    }
    
    initSmoothLoad() {
        // Fade in content
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryPage();
    // Also initialize scroll to top if button exists
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

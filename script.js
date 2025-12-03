// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }
    
    init() {
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('opentales-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Setup toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    setTheme(theme) {
        document.body.className = theme + '-theme';
        localStorage.setItem('opentales-theme', theme);
        
        // Update button icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
            this.themeToggle.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }
    
    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Stories Loader
class StoriesLoader {
    constructor() {
        this.stories = [];
        this.init();
    }
    
    async init() {
        await this.loadStories();
        this.renderStories();
    }
    
    async loadStories() {
        try {
            const response = await fetch('data/stories.json');
            const data = await response.json();
            this.stories = data.stories || [];
        } catch (error) {
            console.error('Error loading stories:', error);
            this.stories = [];
        }
    }
    
    renderStories() {
        const container = document.getElementById('stories-list');
        if (!container) return;
        
        if (this.stories.length === 0) {
            container.innerHTML = '<div class="no-stories">No stories available yet.</div>';
            return;
        }
        
        let html = '';
        
        this.stories.forEach(story => {
            html += `
            <a href="${story.file}" class="story-card">
                <img src="${story.cover}" alt="${story.title}" class="story-image">
                <div class="story-content">
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-description">${story.description}</p>
                    <div class="story-meta">
                        <span>${story.author}</span>
                        <span>${story.genre}</span>
                    </div>
                </div>
            </a>
            `;
        });
        
        container.innerHTML = html;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    new ThemeManager();
    
    // Initialize stories loader
    new StoriesLoader();
});

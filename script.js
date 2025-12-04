// script.js - Main site functionality for homepage

class OpenTales {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadStories();
        this.initTheme();
        this.initEventListeners();
    }
    
    async loadStories() {
        const storiesContainer = document.getElementById('stories');
        const allStoriesContainer = document.getElementById('allStoriesContainer');
        
        if (!storiesContainer && !allStoriesContainer) return;
        
        try {
            // Show loading
            if (storiesContainer) {
                storiesContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        <p>Loading stories...</p>
                    </div>
                `;
            }
            
            // Fetch stories from JSON
            const response = await fetch('data/stories.json');
            const data = await response.json();
            const stories = data.stories || [];
            
            // Generate HTML for stories
            const storiesHTML = stories.map(story => this.createStoryCard(story)).join('');
            
            // Update containers
            if (storiesContainer) {
                storiesContainer.innerHTML = storiesHTML;
            }
            
            if (allStoriesContainer) {
                allStoriesContainer.innerHTML = storiesHTML;
            }
            
        } catch (error) {
            console.error('Error loading stories:', error);
            
            // Show error
            if (storiesContainer) {
                storiesContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <p>Failed to load stories. Please try again later.</p>
                        <button onclick="location.reload()" style="
                            margin-top: 1rem;
                            padding: 0.5rem 1rem;
                            background: var(--accent);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Retry</button>
                    </div>
                `;
            }
        }
    }
    
    createStoryCard(story) {
        return `
        <div class="story">
            <h3>${story.title}</h3>
            <em>by ${story.author}</em>
            <p>${story.description}</p>
            <a href="${story.file}">Read →</a>
        </div>
        `;
    }
    
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        
        if (themeToggle && icon) {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            
            // Setup toggle
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            });
        }
    }
    
    initEventListeners() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OpenTales();
    
    // Add CSS for spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});

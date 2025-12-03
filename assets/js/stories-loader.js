// Stories Loader - Dynamically loads stories from JSON
class StoriesLoader {
    constructor() {
        this.stories = [];
        this.categories = [];
        this.init();
    }
    
    async init() {
        await this.loadStories();
        this.renderFeaturedStories();
        this.renderCategories();
        this.updateStats();
    }
    
    async loadStories() {
        try {
            const response = await fetch('data/stories.json');
            const data = await response.json();
            this.stories = data.stories;
            this.categories = data.categories;
            this.stats = data.stats;
        } catch (error) {
            console.error('Error loading stories:', error);
            this.stories = [];
        }
    }
    
    renderFeaturedStories() {
        const container = document.getElementById('stories-container');
        if (!container || this.stories.length === 0) return;
        
        let html = '';
        this.stories.forEach(story => {
            html += `
            <div class="story-card">
                <img src="${story.cover}" alt="${story.title}" class="story-image">
                <div class="story-content">
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-description">${story.description}</p>
                    <div class="story-meta">
                        <span>${story.genre}</span>
                        <span>${story.chapters} chapters</span>
                        <span>★ ${story.rating}</span>
                    </div>
                    <a href="${story.file}" class="btn" style="margin-top: 15px; display: inline-block;">
                        Read Story
                    </a>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    renderCategories() {
        const container = document.querySelector('.categories-grid');
        if (!container || this.categories.length === 0) return;
        
        let html = '';
        this.categories.forEach(category => {
            const storyCount = this.stories.filter(s => s.genre === category).length;
            html += `
            <a href="/stories/?genre=${category.toLowerCase()}" class="category-item" 
               style="background: var(--card); padding: 20px; border-radius: 5px; text-align: center; border: 1px solid var(--border);">
                <h4 style="margin-bottom: 10px;">${category}</h4>
                <p style="color: #888; font-size: 0.9rem;">${storyCount} stories</p>
            </a>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateStats() {
        if (this.stats) {
            document.getElementById('total-stories').textContent = this.stats.totalStories;
            document.getElementById('total-chapters').textContent = this.stats.totalChapters;
            document.getElementById('total-words').textContent = this.stats.totalWords.toLocaleString();
            document.getElementById('avg-rating').textContent = this.stats.avgRating;
        }
    }
    
    searchStories(query) {
        if (!query) return [];
        
        return this.stories.filter(story => {
            const searchText = `
                ${story.title.toLowerCase()}
                ${story.description.toLowerCase()}
                ${story.genre.toLowerCase()}
                ${story.tags.join(' ').toLowerCase()}
                ${story.author.toLowerCase()}
            `;
            return searchText.includes(query.toLowerCase());
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StoriesLoader();
    
    // Setup search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            const loader = new StoriesLoader();
            await loader.loadStories();
            const results = loader.searchStories(this.value);
            
            const resultsContainer = document.getElementById('search-results');
            if (results.length > 0 && this.value.length > 2) {
                let html = '<div style="background: var(--card); border: 1px solid var(--border); border-radius: 5px; padding: 10px; margin-top: 5px;">';
                results.slice(0, 5).forEach(story => {
                    html += `
                    <a href="${story.file}" style="display: block; padding: 8px; border-bottom: 1px solid var(--border);">
                        <strong>${story.title}</strong><br>
                        <small>${story.genre} • ${story.chapters} chapters</small>
                    </a>
                    `;
                });
                html += '</div>';
                resultsContainer.innerHTML = html;
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.style.display = 'none';
            }
        });
    }
});

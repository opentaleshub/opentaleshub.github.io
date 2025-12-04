// Open Tales Hub - Main JavaScript
class OpenTalesHub {
    constructor() {
        this.stories = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.readingProgress = JSON.parse(localStorage.getItem('readingProgress')) || {};
        this.storiesRead = JSON.parse(localStorage.getItem('storiesRead')) || [];

        // APIs
        this.quoteApi = 'https://api.quotable.io/random';
        this.weatherApi = 'https://api.open-meteo.com/v1/forecast';

        // DOM Elements
        this.elements = {};

        this.init();
    }

    async init() {
        this.cacheElements();
        this.initTheme();
        this.initParticles();
        this.initEventListeners();
        this.loadStories();
        this.loadDailyQuote();
        this.updateStats();
        this.setupSpotlight();
        this.updateCurrentYear();

        // Check for new features
        this.checkForNewFeatures();
    }

    cacheElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            searchToggle: document.getElementById('searchToggle'),
            searchOverlay: document.getElementById('searchOverlay'),
            closeSearch: document.getElementById('closeSearch'),
            searchInput: document.getElementById('searchInput'),
            searchResults: document.getElementById('searchResults'),
            storiesGrid: document.getElementById('storiesGrid'),
            sortStories: document.getElementById('sortStories'),
            refreshQuote: document.getElementById('refreshQuote'),
            dailyQuote: document.getElementById('dailyQuote'),
            fabTop: document.getElementById('fabTop'),
            aboutModal: document.getElementById('aboutModal'),
            aboutModalOverlay: document.getElementById('aboutModalOverlay'),
            closeAboutModal: document.getElementById('closeAboutModal'),
            toastContainer: document.getElementById('toastContainer'),
            randomStory: document.getElementById('randomStory'),
            toggleThemeFooter: document.getElementById('toggleThemeFooter'),
            totalStories: document.getElementById('totalStories'),
            totalReadingTime: document.getElementById('totalReadingTime'),
            storiesRead: document.getElementById('storiesRead'),
            favoritesCount: document.getElementById('favoritesCount'),
            storyOfDay: document.getElementById('storyOfDay'),
            spotlightTitle: document.getElementById('spotlightTitle'),
            spotlightAuthor: document.getElementById('spotlightAuthor'),
            spotlightDesc: document.getElementById('spotlightDesc'),
            spotlightLink: document.getElementById('spotlightLink')
        };
    }

    initTheme() {
        // Check for saved theme or prefer-color-scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);

        // Update theme toggle icon
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

        // Add transition after initial load
        setTimeout(() => {
            document.body.style.transition = 'background-color 0.3s, color 0.3s';
        }, 100);
    }

    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles', {
                particles: {
                    number: { value: 40, density: { enable: true, value_area: 800 } },
                    color: { value: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8b5cf6' : '#7c3aed' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.1, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: false },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out'
                    }
                },
                interactivity: {
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' }
                    }
                }
            });
        }
    }

    initEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Search
        this.elements.searchToggle.addEventListener('click', () => this.openSearch());
        this.elements.closeSearch.addEventListener('click', () => this.closeSearch());
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Close search on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.searchOverlay.classList.contains('active')) {
                this.closeSearch();
            }
        });

        // Sort stories
        this.elements.sortStories.addEventListener('change', (e) => this.sortStories(e.target.value));

        // Refresh quote
        this.elements.refreshQuote.addEventListener('click', () => this.loadDailyQuote());

        // FAB scroll to top
        this.elements.fabTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.showToast('Scroll to top!', 'success');
        });

        // Show/hide FAB based on scroll
        window.addEventListener('scroll', () => {
            const fab = this.elements.fabTop;
            if (window.scrollY > 300) {
                fab.classList.add('visible');
            } else {
                fab.classList.remove('visible');
            }
        });

        // Modal
        if (this.elements.aboutModal) {
            this.elements.aboutModal.addEventListener('click', () => this.openModal());
        }
        this.elements.closeAboutModal.addEventListener('click', () => this.closeModal());
        this.elements.aboutModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.aboutModalOverlay) {
                this.closeModal();
            }
        });

        // Random story
        if (this.elements.randomStory) {
            this.elements.randomStory.addEventListener('click', (e) => {
                e.preventDefault();
                this.openRandomStory();
            });
        }

        // Theme toggle from footer
        if (this.elements.toggleThemeFooter) {
            this.elements.toggleThemeFooter.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            // Ctrl/Cmd + / for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleTheme();
            }

            // R for random story
            if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
                this.openRandomStory();
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

        // Update particles color
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles', {
                particles: {
                    color: { value: newTheme === 'dark' ? '#8b5cf6' : '#7c3aed' }
                }
            });
        }

        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }

    openSearch() {
        this.elements.searchOverlay.classList.add('active');
        this.elements.searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    closeSearch() {
        this.elements.searchOverlay.classList.remove('active');
        this.elements.searchInput.value = '';
        this.elements.searchResults.innerHTML = '';
        document.body.style.overflow = '';
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.elements.searchResults.innerHTML = '';
            return;
        }

        const filteredStories = this.stories.filter(story =>
            story.title.toLowerCase().includes(query.toLowerCase()) ||
            story.author.toLowerCase().includes(query.toLowerCase()) ||
            story.description.toLowerCase().includes(query.toLowerCase()) ||
            story.genre.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(filteredStories, query);
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            this.elements.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>No stories found</h4>
                    <p>No stories match "${query}"</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(story => `
            <div class="search-result-item" data-id="${story.id}">
                <div class="result-content">
                    <h4>${story.title}</h4>
                    <p class="result-author">by ${story.author}</p>
                    <p class="result-desc">${story.description}</p>
                </div>
                <a href="${story.file}" class="result-link">
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `).join('');

        this.elements.searchResults.innerHTML = `
            <div class="results-header">
                <p>Found ${results.length} story${results.length === 1 ? '' : 's'}</p>
            </div>
            ${resultsHTML}
        `;

        // Add click handlers
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.result-link')) {
                    const link = item.querySelector('.result-link');
                    window.location.href = link.href;
                    this.closeSearch();
                }
            });
        });
    }

    async loadStories() {
        try {
            // Show loading state
            this.elements.storiesGrid.innerHTML = `
                <div class="loading-stories">
                    <div class="spinner">
                        <div class="spinner-circle"></div>
                        <div class="spinner-circle"></div>
                        <div class="spinner-circle"></div>
                    </div>
                    <p>Loading magical stories...</p>
                </div>
            `;

            // Load stories from JSON
            const response = await fetch('data/stories.json');
            const data = await response.json();
            this.stories = data.stories || [];

            // Update total stories count
            this.elements.totalStories.textContent = `${this.stories.length}+ Stories`;

            // Display stories with staggered animation
            this.displayStories(this.stories);

            // Add CSS for animations
            this.addStoryCardAnimations();

        } catch (error) {
            console.error('Error loading stories:', error);
            this.showToast('Failed to load stories. Please try again.', 'error');

            this.elements.storiesGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Something went wrong</h4>
                    <p>Unable to load stories at the moment.</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    displayStories(stories) {
        if (stories.length === 0) {
            this.elements.storiesGrid.innerHTML = `
                <div class="no-stories">
                    <i class="fas fa-book"></i>
                    <h4>No stories yet</h4>
                    <p>Check back soon for new stories!</p>
                </div>
            `;
            return;
        }

        const storiesHTML = stories.map((story, index) => this.createStoryCard(story, index)).join('');
        this.elements.storiesGrid.innerHTML = storiesHTML;

        // Initialize story card interactions
        this.initStoryCardInteractions();
    }

    createStoryCard(story, index) {
        const isFavorite = this.favorites.includes(story.id);
        const readProgress = this.readingProgress[story.id] || 0;
        const isRead = this.storiesRead.includes(story.id);

        // Calculate reading time (approx 200 words per minute)
        const wordCount = story.description.split(' ').length + (story.title.split(' ').length * 2);
        const readingTime = Math.max(5, Math.ceil(wordCount / 200));

        // Add delay for staggered animation
        const animationDelay = `${index * 0.1}s`;

        return `
            <div class="story-card" style="animation-delay: ${animationDelay};" data-id="${story.id}">
                <div class="story-card-header">
                    <span class="story-card-genre">${story.genre}</span>
                    <h3 class="story-card-title">${story.title}</h3>
                    <p class="story-card-author">
                        <i class="fas fa-user-pen"></i>
                        ${story.author}
                    </p>
                </div>
                <div class="story-card-body">
                    <p class="story-card-description">${story.description}</p>
                    <div class="story-card-meta">
                        <div class="story-card-time">
                            <i class="fas fa-clock"></i>
                            <span>${readingTime} min read</span>
                        </div>
                        <div class="story-card-actions">
                            <button class="story-card-btn favorite ${isFavorite ? 'active' : ''}"
                                    aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="story-card-btn share" aria-label="Share story">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <a href="${story.file}" class="read-story-btn">
                    <i class="fas fa-book-open"></i>
                    Read Story
                    ${isRead ? '<span class="read-badge"><i class="fas fa-check"></i></span>' : ''}
                </a>
                ${readProgress > 0 ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${readProgress}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    addStoryCardAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .story-card {
                animation: fadeInUp 0.6s ease-out;
                animation-fill-mode: both;
                opacity: 0;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .progress-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(139, 92, 246, 0.1);
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%);
                transition: width 0.3s ease;
            }

            .read-badge {
                margin-left: 8px;
                background: var(--success);
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
            }
        `;
        document.head.appendChild(style);
    }

    initStoryCardInteractions() {
        // Favorite buttons
        document.querySelectorAll('.story-card-btn.favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.story-card');
                const storyId = card.dataset.id;
                this.toggleFavorite(storyId, btn);
            });
        });

        // Share buttons
        document.querySelectorAll('.story-card-btn.share').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.story-card');
                const storyId = card.dataset.id;
                const story = this.stories.find(s => s.id === storyId);
                if (story) {
                    this.shareStory(story);
                }
            });
        });

        // Card click for quick read
        document.querySelectorAll('.story-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons or links
                if (!e.target.closest('.story-card-btn') && !e.target.closest('a')) {
                    const link = card.querySelector('.read-story-btn');
                    if (link) {
                        // Mark as started reading
                        const storyId = card.dataset.id;
                        if (!this.storiesRead.includes(storyId)) {
                            this.storiesRead.push(storyId);
                            localStorage.setItem('storiesRead', JSON.stringify(this.storiesRead));
                            this.updateStats();
                        }

                        // Navigate to story
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    toggleFavorite(storyId, button) {
        const index = this.favorites.indexOf(storyId);
        const isFavorite = index > -1;

        if (isFavorite) {
            this.favorites.splice(index, 1);
            button.classList.remove('active');
            this.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(storyId);
            button.classList.add('active');
            this.showToast('Added to favorites', 'success');

            // Add favorite animation
            button.style.animation = 'none';
            setTimeout(() => {
                button.style.animation = 'heartBeat 0.5s ease';
            }, 10);
        }

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateStats();

        // Add heartBeat animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heartBeat {
                0% { transform: scale(1); }
                14% { transform: scale(1.3); }
                28% { transform: scale(1); }
                42% { transform: scale(1.3); }
                70% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    shareStory(story) {
        if (navigator.share) {
            navigator.share({
                title: story.title,
                text: `Check out "${story.title}" by ${story.author} on Open Tales Hub`,
                url: window.location.origin + '/' + story.file
            })
            .then(() => this.showToast('Story shared successfully!', 'success'))
            .catch(() => this.showToast('Sharing cancelled', 'info'));
        } else {
            // Fallback: Copy to clipboard
            const url = window.location.origin + '/' + story.file;
            navigator.clipboard.writeText(`${story.title} - ${url}`)
                .then(() => this.showToast('Link copied to clipboard!', 'success'))
                .catch(() => this.showToast('Failed to copy link', 'error'));
        }
    }

    sortStories(method) {
        let sortedStories = [...this.stories];

        switch (method) {
            case 'title':
                sortedStories.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                sortedStories.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'newest':
                // Assuming newer stories are at the end of the array
                sortedStories.reverse();
                break;
            default:
                // Default order (as in JSON)
                break;
        }

        this.displayStories(sortedStories);
        this.showToast(`Sorted by: ${method === 'default' ? 'featured' : method}`, 'info');
    }

    async loadDailyQuote() {
        try {
            const btn = this.elements.refreshQuote;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

            const response = await fetch(this.quoteApi);
            const data = await response.json();

            this.elements.dailyQuote.querySelector('.quote-text').textContent = `"${data.content}"`;
            this.elements.dailyQuote.querySelector('.quote-author').textContent = `— ${data.author}`;

            // Save quote for today
            localStorage.setItem('dailyQuote', JSON.stringify({
                quote: data.content,
                author: data.author,
                date: new Date().toDateString()
            }));

            // Add subtle animation
            this.elements.dailyQuote.style.animation = 'none';
            setTimeout(() => {
                this.elements.dailyQuote.style.animation = 'fadeIn 0.8s ease-out';
            }, 10);

            this.showToast('New quote loaded!', 'success');

        } catch (error) {
            console.error('Error loading quote:', error);
            this.showToast('Failed to load quote. Using saved one.', 'error');

            // Try to load saved quote
            const savedQuote = localStorage.getItem('dailyQuote');
            if (savedQuote) {
                const { quote, author } = JSON.parse(savedQuote);
                this.elements.dailyQuote.querySelector('.quote-text').textContent = `"${quote}"`;
                this.elements.dailyQuote.querySelector('.quote-author').textContent = `— ${author}`;
            }
        } finally {
            const btn = this.elements.refreshQuote;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> New Quote';
        }
    }

    setupSpotlight() {
        // Pick a random story for spotlight
        if (this.stories.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.stories.length);
            const spotlightStory = this.stories[randomIndex];

            this.elements.spotlightTitle.textContent = spotlightStory.title;
            this.elements.spotlightAuthor.textContent = `by ${spotlightStory.author}`;
            this.elements.spotlightDesc.textContent = spotlightStory.description;
            this.elements.spotlightLink.href = spotlightStory.file;

            // Update daily if needed
            const lastSpotlight = localStorage.getItem('lastSpotlight');
            const today = new Date().toDateString();

            if (lastSpotlight !== today) {
                localStorage.setItem('lastSpotlight', today);
            }
        }
    }

    updateStats() {
        // Update stories read count
        const readCount = this.storiesRead.length;
        this.elements.storiesRead.textContent = readCount;

        // Update favorites count
        this.elements.favoritesCount.textContent = this.favorites.length;

        // Calculate total reading time (assuming 5-15 min per story)
        const totalReadingTime = this.stories.reduce((total, story) => {
            const wordCount = story.description.split(' ').length + (story.title.split(' ').length * 2);
            return total + Math.max(5, Math.ceil(wordCount / 200));
        }, 0);

        this.elements.totalReadingTime.textContent = `${totalReadingTime} min`;
    }

    updateCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    openRandomStory() {
        if (this.stories.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.stories.length);
            const randomStory = this.stories[randomIndex];

            this.showToast(`Taking you to: ${randomStory.title}`, 'info');

            // Small delay for toast
            setTimeout(() => {
                window.location.href = randomStory.file;
            }, 1000);
        }
    }

    openModal() {
        this.elements.aboutModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.elements.aboutModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <div class="toast-content">
                <p>${message}</p>
            </div>
            <button class="close-toast">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            this.removeToast(toast);
        }, 5000);

        // Close button
        toast.querySelector('.close-toast').addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeToast(toast);
        });

        // Add styles for toast
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    animation: slideInUp 0.3s ease-out;
                }

                @keyframes slideInUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    checkForNewFeatures() {
        // Check if user has visited before
        const lastVisit = localStorage.getItem('lastVisit');
        const now = new Date();

        if (!lastVisit) {
            // First visit
            setTimeout(() => {
                this.showToast('Welcome to Open Tales Hub! Explore our collection of stories.', 'info');
            }, 2000);
        } else {
            const daysSinceLastVisit = Math.floor((now - new Date(lastVisit)) / (1000 * 60 * 60 * 24));

            if (daysSinceLastVisit > 7) {
                this.showToast('Welcome back! We have new stories for you.', 'success');
            }
        }

        localStorage.setItem('lastVisit', now.toISOString());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new OpenTalesHub();

    // Make app available globally for debugging
    window.OpenTalesHub = app;

    // Add service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        });
    }
});

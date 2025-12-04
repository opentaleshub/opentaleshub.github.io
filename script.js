// OpenTalesHub - Pixel Art Story Hub
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const storiesContainer = document.getElementById('stories-container');
    const genreFilter = document.getElementById('genre-filter');
    const searchInput = document.getElementById('search-input');
    const themeBtn = document.getElementById('theme-btn');
    const themeLabel = document.querySelector('.theme-label');
    const starsContainer = document.querySelector('.stars-container');
    const body = document.body;
    
    // State
    let allStories = [];
    let filteredStories = [];
    let isNightMode = false;
    
    // Initialize stars for night mode
    createStars();
    
    // Load stories from JSON
    loadStories();
    
    // Theme Toggle Event
    themeBtn.addEventListener('click', toggleTheme);
    
    // Search and Filter Events
    searchInput.addEventListener('input', filterStories);
    genreFilter.addEventListener('change', filterStories);
    
    // Initialize with saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'night') {
        enableNightMode();
    }
    
    // Functions
    function loadStories() {
        fetch('data/stories.json')
            .then(response => response.json())
            .then(data => {
                allStories = data.stories;
                filteredStories = [...allStories];
                displayStories(allStories);
            })
            .catch(error => {
                console.error('Error loading stories:', error);
                storiesContainer.innerHTML = '<div class="no-stories">Error loading stories. Please refresh the page.</div>';
            });
    }
    
    function displayStories(stories) {
        if (!storiesContainer) return;
        
        storiesContainer.innerHTML = '';
        
        if (stories.length === 0) {
            storiesContainer.innerHTML = '<div class="no-stories">No stories found. Try a different search or filter.</div>';
            return;
        }
        
        stories.forEach(story => {
            const storyCard = createStoryCard(story);
            storiesContainer.appendChild(storyCard);
        });
    }
    
    function createStoryCard(story) {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.setAttribute('data-genre', story.genre);
        
        // Fix file path if needed
        let storyFile = story.file;
        if (!storyFile.startsWith('http') && !storyFile.startsWith('/')) {
            storyFile = './' + storyFile;
        }
        
        card.innerHTML = `
            <h3 class="story-title">${story.title}</h3>
            <p class="story-author">by ${story.author}</p>
            <p class="story-description">${story.description}</p>
            <span class="story-genre">${story.genre}</span>
            <br>
            <a href="${storyFile}" class="read-btn">Read Story →</a>
        `;
        
        return card;
    }
    
    function filterStories() {
        const selectedGenre = genreFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredStories = allStories.filter(story => {
            // Filter by genre
            const genreMatch = !selectedGenre || story.genre === selectedGenre;
            
            // Filter by search term
            const searchMatch = !searchTerm || 
                story.title.toLowerCase().includes(searchTerm) ||
                story.author.toLowerCase().includes(searchTerm) ||
                story.description.toLowerCase().includes(searchTerm) ||
                story.genre.toLowerCase().includes(searchTerm);
            
            return genreMatch && searchMatch;
        });
        
        displayStories(filteredStories);
    }
    
    function toggleTheme() {
        if (isNightMode) {
            enableDayMode();
        } else {
            enableNightMode();
        }
    }
    
    function enableNightMode() {
        body.classList.remove('day-theme');
        body.classList.add('night-theme');
        themeLabel.textContent = 'Night Mode';
        isNightMode = true;
        localStorage.setItem('theme', 'night');
        showStars(true);
    }
    
    function enableDayMode() {
        body.classList.remove('night-theme');
        body.classList.add('day-theme');
        themeLabel.textContent = 'Day Mode';
        isNightMode = false;
        localStorage.setItem('theme', 'day');
        showStars(false);
    }
    
    function createStars() {
        // Clear existing stars
        starsContainer.innerHTML = '';
        
        // Create 100 stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // Random size
            const size = Math.random() * 3 + 1;
            
            // Random animation delay
            const delay = Math.random() * 2;
            
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${delay}s`;
            
            starsContainer.appendChild(star);
        }
    }
    
    function showStars(show) {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.style.opacity = show ? '1' : '0';
            star.style.pointerEvents = show ? 'auto' : 'none';
        });
    }
    
    // Add pixel art click effects
    document.querySelectorAll('.pixel-character').forEach(char => {
        char.addEventListener('click', function() {
            this.style.transform = 'scale(1.5)';
            this.style.filter = 'brightness(1.5)';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.filter = '';
            }, 300);
        });
    });
    
    // Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Toggle theme with 't' key
        if (e.key === 't' || e.key === 'T') {
            toggleTheme();
        }
        
        // Focus search with '/' key
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Clear search with 'Escape'
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            filterStories();
        }
    });
    
    // Show keyboard shortcuts help
    console.log('Keyboard shortcuts:');
    console.log('  T - Toggle day/night mode');
    console.log('  / - Focus search box');
    console.log('  Esc - Clear search');
});

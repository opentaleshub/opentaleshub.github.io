// OpenTalesHub RPG JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const storyCountEl = document.getElementById('story-count');
    const adventureLevelEl = document.getElementById('adventure-level');
    const storiesContainer = document.getElementById('stories-container');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const randomStoryBtn = document.getElementById('random-story');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('story-search');
    const totalStoriesEl = document.getElementById('total-stories');
    const bookmarkCountEl = document.getElementById('bookmark-count');
    const readingTimeEl = document.getElementById('reading-time');
    const resumeReadingBtn = document.getElementById('resume-reading');
    const contributeBtn = document.getElementById('contribute-btn');

    // Game State
    let gameState = {
        darkMode: false,
        bookmarks: JSON.parse(localStorage.getItem('opentaleshub_bookmarks')) || [],
        readingProgress: JSON.parse(localStorage.getItem('opentaleshub_progress')) || {},
        stories: [],
        categories: {
            'mystery': ['The Tell-Tale Heart', 'The Lottery'],
            'adventure': ['To Build a Fire', 'The Great Stone Face'],
            'classic': ['The Gift of the Magi', 'The Birthmark', 'What Men Live By'],
            'fantasy': [] // Add your fantasy stories here
        }
    };

    // Initialize the game
    initGame();

    function initGame() {
        // Load stories from data/stories.json
        loadStories();

        // Update stats
        updateStats();

        // Set up event listeners
        setupEventListeners();

        // Set up fake loading animation
        simulateLoading();

        // Update next update timer
        updateNextUpdateTimer();
    }

    function loadStories() {
        // Try to load from data/stories.json
        fetch('data/stories.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Stories file not found');
                }
                return response.json();
            })
            .then(data => {
                gameState.stories = data.stories || [];
                displayStories(gameState.stories);
                updateStoryCount();
                updateCategoryCounts();
            })
            .catch(error => {
                console.log('Could not load stories.json, using fallback data:', error);
                // Fallback to hardcoded stories based on your file structure
                gameState.stories = getFallbackStories();
                displayStories(gameState.stories);
                updateStoryCount();
                updateCategoryCounts();
            });
    }

    function getFallbackStories() {
        // Create story objects based on your existing story files
        return [
            {
                id: 'tell-tale-heart',
                title: 'The Tell-Tale Heart',
                author: 'Edgar Allan Poe',
                description: 'A haunting tale of guilt and madness, where a murderer is tormented by the sound of his victim\'s beating heart.',
                readTime: 15,
                date: '1843',
                filename: 'tell-tale-heart.html',
                category: 'mystery',
                icon: '🫀'
            },
            {
                id: 'the-gift-of-magi',
                title: 'The Gift of the Magi',
                author: 'O. Henry',
                description: 'A young couple sacrifices their most prized possessions to buy Christmas gifts for each other.',
                readTime: 10,
                date: '1905',
                filename: 'the-gift-of-magi.html',
                category: 'classic',
                icon: '🎁'
            },
            {
                id: 'the-lottery',
                title: 'The Lottery',
                author: 'Shirley Jackson',
                description: 'A small town holds its annual lottery with a shocking and brutal tradition.',
                readTime: 20,
                date: '1948',
                filename: 'the-lottery.html',
                category: 'mystery',
                icon: '🎫'
            },
            {
                id: 'what-men-live-by',
                title: 'What Men Live By',
                author: 'Leo Tolstoy',
                description: 'A shoemaker takes in a mysterious stranger and learns profound lessons about humanity.',
                readTime: 25,
                date: '1885',
                filename: 'what-men-live-by.html',
                category: 'classic',
                icon: '👞'
            },
            {
                id: 'the-birthmark',
                title: 'The Birthmark',
                author: 'Nathaniel Hawthorne',
                description: 'A scientist becomes obsessed with removing a small birthmark from his wife\'s cheek.',
                readTime: 30,
                date: '1843',
                filename: 'the-birthmark.html',
                category: 'classic',
                icon: '🔬'
            },
            {
                id: 'the-great-stone-face',
                title: 'The Great Stone Face',
                author: 'Nathaniel Hawthorne',
                description: 'A prophecy about a man who will resemble the Great Stone Face brings hope to a valley.',
                readTime: 35,
                date: '1850',
                filename: 'the-great-stone-face.html',
                category: 'adventure',
                icon: '🗿'
            },
            {
                id: 'to-build-a-fire',
                title: 'To Build a Fire',
                author: 'Jack London',
                description: 'A man and his dog travel through the Yukon wilderness in extreme cold.',
                readTime: 40,
                date: '1908',
                filename: 'to-build-a-fire.html',
                category: 'adventure',
                icon: '🔥'
            }
        ];
    }

    function displayStories(stories) {
        if (stories.length === 0) {
            storiesContainer.innerHTML = `
                <div class="no-stories">
                    <h3>No stories found in the archives</h3>
                    <p>The scribes are busy transcribing new tales. Check back soon!</p>
                </div>
            `;
            return;
        }

        let html = '';

        stories.forEach(story => {
            const isBookmarked = gameState.bookmarks.includes(story.id);
            const readProgress = gameState.readingProgress[story.id] || 0;
            const progressPercent = readProgress > 0 ? Math.min(readProgress, 100) : 0;

            html += `
                <div class="story-card" data-category="${story.category}" data-readtime="${story.readTime}">
                    <div class="story-icon">${story.icon || '📖'}</div>
                    <h3 class="story-title">${story.title}</h3>
                    <div class="story-author">by ${story.author}</div>
                    <p class="story-description">${story.description}</p>

                    ${readProgress > 0 ? `
                    <div class="progress-bar" style="margin-bottom: 10px;">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    ` : ''}

                    <div class="story-meta">
                        <div class="read-time"><i class="fas fa-hourglass-half"></i> ${story.readTime} min</div>
                        <div class="story-date"><i class="fas fa-calendar"></i> ${story.date}</div>
                    </div>

                    <button class="read-btn" data-story="${story.id}">
                        <i class="fas fa-book-open"></i> Begin Reading
                    </button>

                    <button class="bookmark-btn" data-story="${story.id}" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: ${isBookmarked ? 'var(--gold)' : 'var(--stone)'};
                    ">
                        ${isBookmarked ? '🔖' : '📑'}
                    </button>
                </div>
            `;
        });

        storiesContainer.innerHTML = html;

        // Add event listeners to story buttons
        document.querySelectorAll('.read-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.getAttribute('data-story');
                startReading(storyId);
            });
        });

        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.getAttribute('data-story');
                toggleBookmark(storyId, this);
            });
        });
    }

    function startReading(storyId) {
        const story = gameState.stories.find(s => s.id === storyId);
        if (story) {
            // Track reading start
            if (!gameState.readingProgress[storyId]) {
                gameState.readingProgress[storyId] = 0;
            }

            // Update current reading in localStorage
            localStorage.setItem('opentaleshub_current', storyId);
            localStorage.setItem('opentaleshub_progress', JSON.stringify(gameState.readingProgress));

            // Navigate to story page
            window.location.href = `stories/${story.filename}`;
        }
    }

    function toggleBookmark(storyId, button) {
        const index = gameState.bookmarks.indexOf(storyId);

        if (index === -1) {
            // Add bookmark
            gameState.bookmarks.push(storyId);
            button.innerHTML = '🔖';
            button.style.color = 'var(--gold)';

            // Show notification
            showNotification('Story added to bookmarks!', 'success');
        } else {
            // Remove bookmark
            gameState.bookmarks.splice(index, 1);
            button.innerHTML = '📑';
            button.style.color = 'var(--stone)';

            // Show notification
            showNotification('Story removed from bookmarks', 'info');
        }

        // Save to localStorage
        localStorage.setItem('opentaleshub_bookmarks', JSON.stringify(gameState.bookmarks));

        // Update bookmark count
        bookmarkCountEl.textContent = gameState.bookmarks.length;
    }

    function updateStats() {
        // Update story count
        storyCountEl.textContent = gameState.stories.length;
        if (totalStoriesEl) totalStoriesEl.textContent = gameState.stories.length;

        // Update bookmark count
        bookmarkCountEl.textContent = gameState.bookmarks.length;

        // Calculate total reading time
        const totalReadingTime = Object.keys(gameState.readingProgress).reduce((total, storyId) => {
            const story = gameState.stories.find(s => s.id === storyId);
            if (story) {
                const progress = gameState.readingProgress[storyId] || 0;
                return total + Math.round((story.readTime * progress) / 100);
            }
            return total;
        }, 0);

        readingTimeEl.textContent = `${totalReadingTime}m`;

        // Calculate adventure level based on reading progress
        const totalProgress = Object.values(gameState.readingProgress).reduce((a, b) => a + b, 0);
        const averageProgress = gameState.stories.length > 0 ? totalProgress / gameState.stories.length : 0;
        const level = Math.floor(averageProgress / 20) + 1;
        adventureLevelEl.textContent = level;

        // Update achievements
        updateAchievements();
    }

    function updateAchievements() {
        const achievements = document.querySelectorAll('.achievement');

        // First Page achievement
        if (Object.keys(gameState.readingProgress).length > 0) {
            achievements[0].classList.remove('locked');
            achievements[0].classList.add('unlocked');
        }

        // Keep Explorer achievement (visits to different sections)
        const visitedSections = JSON.parse(localStorage.getItem('opentaleshub_visited_sections')) || [];
        if (visitedSections.length >= 4) {
            achievements[1].classList.remove('locked');
            achievements[1].classList.add('unlocked');
        }

        // Night Reader achievement (read 5 stories with at least 50% progress)
        const completedStories = Object.entries(gameState.readingProgress)
            .filter(([_, progress]) => progress >= 50).length;

        if (completedStories >= 5) {
            achievements[2].classList.remove('locked');
            achievements[2].classList.add('unlocked');
        }

        // Update weekly quest progress
        const questProgress = Math.min(completedStories, 3);
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill && progressText) {
            const percent = (questProgress / 3) * 100;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${questProgress}/3`;
        }
    }

    function updateCategoryCounts() {
        // Count stories per category
        const categoryCounts = {};

        gameState.stories.forEach(story => {
            if (categoryCounts[story.category]) {
                categoryCounts[story.category]++;
            } else {
                categoryCounts[story.category] = 1;
            }
        });

        // Update category cards
        document.querySelectorAll('.category-card').forEach(card => {
            const category = card.getAttribute('data-category');
            const count = categoryCounts[category] || 0;
            const countElement = card.querySelector('.story-count');

            if (countElement) {
                countElement.textContent = `${count} ${count === 1 ? 'story' : 'stories'}`;
            }
        });
    }

    function updateStoryCount() {
        const count = gameState.stories.length;
        storyCountEl.textContent = count;

        // Update adventure level based on number of stories
        if (count >= 10) {
            adventureLevelEl.textContent = '3';
        } else if (count >= 5) {
            adventureLevelEl.textContent = '2';
        } else {
            adventureLevelEl.textContent = '1';
        }
    }

    function setupEventListeners() {
        // Dark mode toggle
        darkModeBtn.addEventListener('click', function() {
            gameState.darkMode = !gameState.darkMode;
            document.body.classList.toggle('dark-mode', gameState.darkMode);

            if (gameState.darkMode) {
                this.innerHTML = '<i class="fas fa-sun"></i> Daylight Mode';
                showNotification('Torch lit! Reading in dark mode', 'info');
            } else {
                this.innerHTML = '<i class="fas fa-moon"></i> Torch Mode';
                showNotification('Torch extinguished', 'info');
            }

            // Save preference
            localStorage.setItem('opentaleshub_darkmode', gameState.darkMode);
        });

        // Random story button
        randomStoryBtn.addEventListener('click', function() {
            if (gameState.stories.length > 0) {
                const randomIndex = Math.floor(Math.random() * gameState.stories.length);
                const randomStory = gameState.stories[randomIndex];

                showNotification(`Your random quest: "${randomStory.title}"`, 'info');

                // Navigate to story after a short delay
                setTimeout(() => {
                    startReading(randomStory.id);
                }, 1500);
            } else {
                showNotification('No stories available for a random quest', 'error');
            }
        });

        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));

                // Add active class to clicked link
                this.classList.add('active');

                // Get target section
                const targetSection = this.getAttribute('data-section');

                // Hide all sections
                contentSections.forEach(section => {
                    section.classList.remove('active');
                });

                // Show target section
                document.getElementById(targetSection).classList.add('active');

                // Track section visit
                const visitedSections = JSON.parse(localStorage.getItem('opentaleshub_visited_sections')) || [];
                if (!visitedSections.includes(targetSection)) {
                    visitedSections.push(targetSection);
                    localStorage.setItem('opentaleshub_visited_sections', JSON.stringify(visitedSections));
                    updateAchievements();
                }
            });
        });

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all filter buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Get filter value
                const filter = this.getAttribute('data-filter');

                // Filter stories
                let filteredStories = [...gameState.stories];

                if (filter === 'short') {
                    filteredStories = gameState.stories.filter(story => story.readTime <= 15);
                } else if (filter === 'medium') {
                    filteredStories = gameState.stories.filter(story => story.readTime > 15 && story.readTime <= 30);
                } else if (filter === 'long') {
                    filteredStories = gameState.stories.filter(story => story.readTime > 30);
                }

                // Display filtered stories
                displayStories(filteredStories);

                // Show notification
                if (filter !== 'all') {
                    showNotification(`Showing ${filteredStories.length} ${filter} stories`, 'info');
                }
            });
        });

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm.length === 0) {
                displayStories(gameState.stories);
                return;
            }

            const filteredStories = gameState.stories.filter(story =>
                story.title.toLowerCase().includes(searchTerm) ||
                story.author.toLowerCase().includes(searchTerm) ||
                story.description.toLowerCase().includes(searchTerm)
            );

            displayStories(filteredStories);
        });

        // Resume reading button
        if (resumeReadingBtn) {
            resumeReadingBtn.addEventListener('click', function() {
                const currentStoryId = localStorage.getItem('opentaleshub_current');

                if (currentStoryId) {
                    const story = gameState.stories.find(s => s.id === currentStoryId);
                    if (story) {
                        startReading(currentStoryId);
                    } else {
                        showNotification('Could not find your last story', 'error');
                    }
                } else {
                    showNotification('No story in progress', 'info');
                }
            });
        }

        // Contribute button
        if (contributeBtn) {
            contributeBtn.addEventListener('click', function() {
                showNotification('Manuscript submissions open on the next full moon. Check back soon!', 'info');
            });
        }

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const categoryStories = gameState.stories.filter(story => story.category === category);

                // Switch to stories section
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-section="stories"]').classList.add('active');

                contentSections.forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById('stories').classList.add('active');

                // Filter to this category
                filterButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector('[data-filter="all"]').classList.add('active');

                // Display filtered stories
                displayStories(categoryStories);

                showNotification(`Showing ${categoryStories.length} ${category} stories`, 'info');
            });
        });

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem('opentaleshub_darkmode');
        if (savedDarkMode === 'true') {
            gameState.darkMode = true;
            document.body.classList.add('dark-mode');
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Daylight Mode';
        }
    }

    function simulateLoading() {
        // Fake loading delay for effect
        setTimeout(() => {
            document.querySelector('.loading-spinner')?.remove();
        }, 1500);
    }

    function updateNextUpdateTimer() {
        // Calculate days until next update (every 7 days)
        const lastUpdate = localStorage.getItem('opentaleshub_last_update');
        const now = new Date();
        const nextUpdateEl = document.getElementById('next-update');

        if (!nextUpdateEl) return;

        if (!lastUpdate) {
            localStorage.setItem('opentaleshub_last_update', now.toISOString());
            nextUpdateEl.textContent = '7 days';
            return;
        }

        const lastUpdateDate = new Date(lastUpdate);
        const daysSinceUpdate = Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));
        const daysUntilUpdate = 7 - (daysSinceUpdate % 7);

        nextUpdateEl.textContent = `${daysUntilUpdate} ${daysUntilUpdate === 1 ? 'day' : 'days'}`;

        // If it's update day, show special message
        if (daysUntilUpdate === 0 || daysUntilUpdate === 7) {
            nextUpdateEl.textContent = 'Tomorrow!';
            showNotification('New stories arriving tomorrow!', 'success');
        }
    }

    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.rpg-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `rpg-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--parchment-dark);
            border: 3px solid ${type === 'success' ? 'var(--forest)' : type === 'error' ? 'var(--ruby)' : 'var(--stone)'};
            border-radius: 8px;
            padding: 15px 20px;
            z-index: 1000;
            font-family: var(--font-heading);
            color: var(--ink);
            box-shadow: 0 5px 15px var(--shadow);
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Add keyframe animations
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add some interactive sounds (placeholder - would need actual sound files)
    function playSound(type) {
        // This is a placeholder - you would need actual sound files
        console.log(`Playing ${type} sound`);
    }

    // Initialize on load
    window.addEventListener('load', function() {
        // Check for service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    });
});

// Enhanced Story Page JavaScript
class EnhancedStoryPage {
    constructor() {
        this.currentStory = {};
        this.readingProgress = 0;
        this.startTime = null;
        this.totalReadingTime = 0;
        this.isReading = false;

        this.init();
    }

    async init() {
        this.cacheElements();
        this.initTheme();
        this.initProgressBar();
        this.initFontControls();
        this.initReadingTimer();
        this.initChapterNavigation();
        this.initShareFeatures();
        this.initCompletionDetection();
        this.initKeyboardShortcuts();
        this.initSmoothAnimations();
        this.initReadingStats();

        // Load story metadata
        await this.loadStoryMetadata();

        // Start reading session
        this.startReadingSession();
    }

    cacheElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            fontIncrease: document.getElementById('fontIncrease'),
            fontDecrease: document.getElementById('fontDecrease'),
            scrollTopBtn: document.getElementById('scrollTopBtn'),
            progressBar: document.getElementById('progressBar'),
            storyContent: document.querySelector('.story-content'),
            chapterSections: document.querySelectorAll('.chapter-section'),
            shareButton: document.querySelector('.share-story'),
            completionCelebration: document.querySelector('.completion-celebration'),
            readingTime: document.querySelector('.reading-time')
        };
    }

    initTheme() {
        const themeToggle = this.elements.themeToggle;
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');

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

            this.showNotification(`Switched to ${newTheme} theme`);
        });
    }

    initProgressBar() {
        const progressBar = this.elements.progressBar;
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

            progressBar.style.width = scrolled + '%';
            this.readingProgress = scrolled;

            // Save progress every 5%
            if (scrolled % 5 < 0.1) {
                this.saveReadingProgress();
            }

            // Show completion celebration at 95%
            if (scrolled > 95 && !this.completionShown) {
                this.showCompletionCelebration();
            }
        });
    }

    initFontControls() {
        const storyContent = this.elements.storyContent;
        const fontIncrease = this.elements.fontIncrease;
        const fontDecrease = this.elements.fontDecrease;

        if (!storyContent || !fontIncrease || !fontDecrease) return;

        let fontSize = parseInt(localStorage.getItem('storyFontSize')) || 18;
        storyContent.style.fontSize = fontSize + 'px';

        // Add font size display
        const fontSizeDisplay = document.createElement('div');
        fontSizeDisplay.className = 'font-size-display';
        fontSizeDisplay.innerHTML = `
            <span class="font-size-value">${fontSize}px</span>
            <div class="font-size-slider">
                <input type="range" min="14" max="24" value="${fontSize}" class="font-size-range">
            </div>
        `;

        document.querySelector('.reading-controls')?.appendChild(fontSizeDisplay);

        // Range slider
        const rangeSlider = fontSizeDisplay.querySelector('.font-size-range');
        rangeSlider.addEventListener('input', (e) => {
            fontSize = parseInt(e.target.value);
            storyContent.style.fontSize = fontSize + 'px';
            fontSizeDisplay.querySelector('.font-size-value').textContent = fontSize + 'px';
            localStorage.setItem('storyFontSize', fontSize);
        });

        // Button controls
        fontIncrease.addEventListener('click', () => {
            if (fontSize < 24) {
                fontSize += 1;
                storyContent.style.fontSize = fontSize + 'px';
                rangeSlider.value = fontSize;
                fontSizeDisplay.querySelector('.font-size-value').textContent = fontSize + 'px';
                localStorage.setItem('storyFontSize', fontSize);
                this.showNotification(`Font size: ${fontSize}px`);
            }
        });

        fontDecrease.addEventListener('click', () => {
            if (fontSize > 14) {
                fontSize -= 1;
                storyContent.style.fontSize = fontSize + 'px';
                rangeSlider.value = fontSize;
                fontSizeDisplay.querySelector('.font-size-value').textContent = fontSize + 'px';
                localStorage.setItem('storyFontSize', fontSize);
                this.showNotification(`Font size: ${fontSize}px`);
            }
        });
    }

    initScrollToTop() {
        const scrollTopBtn = this.elements.scrollTopBtn;
        if (!scrollTopBtn) return;

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.showNotification('Back to top');
        });

        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.transform = 'translateY(0)';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.transform = 'translateY(10px)';
            }
        });
    }

    initReadingTimer() {
        this.startTime = Date.now();
        this.isReading = true;

        // Update reading time display
        const updateReadingTime = () => {
            if (this.isReading) {
                this.totalReadingTime = Math.floor((Date.now() - this.startTime) / 1000);

                const hours = Math.floor(this.totalReadingTime / 3600);
                const minutes = Math.floor((this.totalReadingTime % 3600) / 60);
                const seconds = this.totalReadingTime % 60;

                let timeString = '';
                if (hours > 0) timeString += `${hours}h `;
                if (minutes > 0) timeString += `${minutes}m `;
                timeString += `${seconds}s`;

                if (this.elements.readingTime) {
                    this.elements.readingTime.querySelector('span').textContent = timeString;
                }
            }
        };

        // Update every second
        this.readingTimer = setInterval(updateReadingTime, 1000);

        // Save reading time when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveReadingTime();
            } else {
                this.startTime = Date.now() - (this.totalReadingTime * 1000);
            }
        });

        // Save on unload
        window.addEventListener('beforeunload', () => {
            this.saveReadingTime();
        });
    }

    initChapterNavigation() {
        const chapters = this.elements.chapterSections;
        if (!chapters.length) return;

        // Create chapter navigation
        const chapterNav = document.createElement('div');
        chapterNav.className = 'chapter-navigation';
        chapterNav.innerHTML = `
            <div class="chapter-nav-header">
                <i class="fas fa-list"></i>
                <span>Chapters</span>
            </div>
            <div class="chapter-list">
                ${Array.from(chapters).map((chapter, index) => {
                    const title = chapter.querySelector('.chapter-title')?.textContent || `Chapter ${index + 1}`;
                    return `<button class="chapter-item" data-index="${index}">${title}</button>`;
                }).join('')}
            </div>
        `;

        document.querySelector('.reading-controls')?.appendChild(chapterNav);

        // Add click handlers
        chapterNav.querySelectorAll('.chapter-item').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                const chapter = chapters[index];

                if (chapter) {
                    chapter.scrollIntoView({ behavior: 'smooth' });
                    this.showNotification(`Jumped to: ${button.textContent}`);

                    // Highlight active chapter
                    chapterNav.querySelectorAll('.chapter-item').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');
                }
            });
        });

        // Highlight current chapter on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chapterIndex = Array.from(chapters).indexOf(entry.target);
                    const chapterItem = chapterNav.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);

                    if (chapterItem) {
                        chapterNav.querySelectorAll('.chapter-item').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        chapterItem.classList.add('active');
                    }
                }
            });
        }, { threshold: 0.5 });

        chapters.forEach(chapter => observer.observe(chapter));
    }

    initShareFeatures() {
        const shareButton = this.elements.shareButton || document.querySelector('.share-story');
        if (!shareButton) return;

        shareButton.addEventListener('click', () => {
            this.shareStory();
        });

        // Add copy link button
        const copyButton = document.createElement('button');
        copyButton.className = 'control-btn copy-link';
        copyButton.innerHTML = '<i class="fas fa-link"></i>';
        copyButton.title = 'Copy story link';
        copyButton.addEventListener('click', () => {
            this.copyStoryLink();
        });

        document.querySelector('.reading-controls')?.appendChild(copyButton);
    }

    initCompletionDetection() {
        // Check if user has completed this story before
        const storyId = this.getStoryId();
        const completedStories = JSON.parse(localStorage.getItem('completedStories')) || [];

        if (completedStories.includes(storyId)) {
            this.showCompletionBadge();
        }
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space to scroll (when not in input)
            if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
                e.preventDefault();
                const scrollAmount = window.innerHeight * 0.8;
                window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }

            // Arrow keys for navigation
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                window.scrollBy({ top: 100, behavior: 'smooth' });
            }
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                window.scrollBy({ top: -100, behavior: 'smooth' });
            }

            // J/K for Vim-like navigation
            if (e.key === 'j') {
                e.preventDefault();
                window.scrollBy({ top: 100, behavior: 'smooth' });
            }
            if (e.key === 'k') {
                e.preventDefault();
                window.scrollBy({ top: -100, behavior: 'smooth' });
            }

            // G/g for top/bottom
            if (e.key === 'g' && e.shiftKey) {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
            if (e.key === 'g' && !e.shiftKey && e.ctrlKey) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // +/- for font size
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.elements.fontIncrease?.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                this.elements.fontDecrease?.click();
            }

            // T for theme toggle
            if (e.key === 't' && e.ctrlKey) {
                e.preventDefault();
                this.elements.themeToggle?.click();
            }

            // S for share
            if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                this.shareStory();
            }

            // ? for help
            if (e.key === '?') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }

    initSmoothAnimations() {
        // Add smooth fade-in for content
        document.body.style.opacity = '0';

        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);

        // Add parallax effect to header
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.story-header');

            if (header) {
                const rate = scrolled * -0.5;
                header.style.transform = `translateY(${rate}px)`;
            }
        });

        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .chapter-section');
        interactiveElements.forEach(el => {
            el.style.transition = 'all 0.3s ease';
        });
    }

    initReadingStats() {
        // Initialize reading stats if not exists
        if (!localStorage.getItem('readingStats')) {
            localStorage.setItem('readingStats', JSON.stringify({
                totalStoriesRead: 0,
                totalReadingTime: 0,
                averageReadingSpeed: 0,
                lastRead: null
            }));
        }
    }

    async loadStoryMetadata() {
        // Extract story metadata from page
        const title = document.querySelector('.story-header h1')?.textContent || '';
        const author = document.querySelector('.story-meta .author')?.textContent || '';

        this.currentStory = {
            id: this.getStoryId(),
            title: title,
            author: author,
            url: window.location.href,
            wordCount: this.countWords()
        };

        // Update reading time estimate
        this.updateReadingTimeEstimate();
    }

    startReadingSession() {
        const storyId = this.getStoryId();
        const readingSessions = JSON.parse(localStorage.getItem('readingSessions')) || {};

        readingSessions[storyId] = {
            startTime: new Date().toISOString(),
            progress: 0
        };

        localStorage.setItem('readingSessions', JSON.stringify(readingSessions));
    }

    saveReadingProgress() {
        const storyId = this.getStoryId();
        const readingProgress = JSON.parse(localStorage.getItem('readingProgress')) || {};

        readingProgress[storyId] = this.readingProgress;
        localStorage.setItem('readingProgress', JSON.stringify(readingProgress));
    }

    saveReadingTime() {
        if (this.totalReadingTime > 0) {
            const storyId = this.getStoryId();
            const readingTimes = JSON.parse(localStorage.getItem('readingTimes')) || {};

            readingTimes[storyId] = (readingTimes[storyId] || 0) + this.totalReadingTime;
            localStorage.setItem('readingTimes', JSON.stringify(readingTimes));

            // Update global stats
            const stats = JSON.parse(localStorage.getItem('readingStats'));
            stats.totalReadingTime += this.totalReadingTime;
            stats.lastRead = new Date().toISOString();
            localStorage.setItem('readingStats', JSON.stringify(stats));
        }
    }

    shareStory() {
        if (navigator.share) {
            navigator.share({
                title: this.currentStory.title,
                text: `Read "${this.currentStory.title}" by ${this.currentStory.author}`,
                url: this.currentStory.url
            })
            .then(() => this.showNotification('Story shared successfully!'))
            .catch(() => this.showNotification('Sharing cancelled'));
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(`${this.currentStory.title} - ${this.currentStory.url}`)
                .then(() => this.showNotification('Link copied to clipboard!'))
                .catch(() => this.showNotification('Failed to copy link'));
        }
    }

    copyStoryLink() {
        navigator.clipboard.writeText(this.currentStory.url)
            .then(() => this.showNotification('Story link copied!'))
            .catch(() => this.showNotification('Failed to copy link'));
    }

    showCompletionCelebration() {
        this.completionShown = true;

        // Mark story as completed
        const storyId = this.getStoryId();
        const completedStories = JSON.parse(localStorage.getItem('completedStories')) || [];

        if (!completedStories.includes(storyId)) {
            completedStories.push(storyId);
            localStorage.setItem('completedStories', JSON.stringify(completedStories));

            // Update stats
            const stats = JSON.parse(localStorage.getItem('readingStats'));
            stats.totalStoriesRead += 1;
            localStorage.setItem('readingStats', JSON.stringify(stats));

            // Show celebration
            const celebration = document.createElement('div');
            celebration.className = 'completion-celebration active';
            celebration.innerHTML = `
                <div class="celebration-content">
                    <div class="celebration-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>Story Completed! 🎉</h3>
                    <p>You've finished reading "${this.currentStory.title}"</p>
                    <div class="celebration-stats">
                        <p><i class="fas fa-clock"></i> Reading time: ${this.formatTime(this.totalReadingTime)}</p>
                        <p><i class="fas fa-book"></i> Total stories read: ${stats.totalStoriesRead}</p>
                    </div>
                    <button class="celebration-close">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            `;

            document.body.appendChild(celebration);

            // Close button
            celebration.querySelector('.celebration-close').addEventListener('click', () => {
                celebration.remove();
            });

            // Auto close after 8 seconds
            setTimeout(() => {
                if (document.body.contains(celebration)) {
                    celebration.remove();
                }
            }, 8000);
        }
    }

    showCompletionBadge() {
        const badge = document.createElement('div');
        badge.className = 'completion-badge';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Previously Read';
        badge.title = 'You have completed this story before';

        document.querySelector('.story-header')?.appendChild(badge);
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Space', desc: 'Scroll down one page' },
            { key: 'J/K', desc: 'Scroll up/down' },
            { key: 'Ctrl + +/-', desc: 'Increase/decrease font size' },
            { key: 'Ctrl + T', desc: 'Toggle theme' },
            { key: 'Ctrl + S', desc: 'Share story' },
            { key: '?', desc: 'Show this help' }
        ];

        const helpText = shortcuts.map(s => `<strong>${s.key}</strong>: ${s.desc}`).join('<br>');

        this.showNotification(`<div style="text-align: left; line-height: 1.6;">${helpText}</div>`, 5000);
    }

    showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'story-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }, duration);

        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .story-notification {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1rem 1.5rem;
                    box-shadow: var(--shadow-xl);
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 10000;
                    max-width: 300px;
                }

                .story-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }

                .notification-content p {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateReadingTimeEstimate() {
        const wordCount = this.currentStory.wordCount;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

        const timeDisplay = this.elements.readingTime;
        if (timeDisplay) {
            timeDisplay.querySelector('.estimate').textContent = `Est. ${readingTime} min`;
        }
    }

    countWords() {
        const content = this.elements.storyContent;
        if (!content) return 0;

        const text = content.textContent || '';
        return text.trim().split(/\s+/).length;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    getStoryId() {
        // Generate ID from URL or title
        const path = window.location.pathname;
        const match = path.match(/\/([^\/]+)\.html$/);
        return match ? match[1] : btoa(this.currentStory.title);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const storyPage = new EnhancedStoryPage();

    // Initialize scroll to top
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Make available globally
    window.StoryPage = storyPage;
});

// OpenTalesHub Story Reader JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const storyContent = document.querySelector('.story-body');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const backButton = document.querySelector('.back-button');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const largeTextBtn = document.getElementById('large-text-btn');
    const serifFontBtn = document.getElementById('serif-font-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    const markCompleteBtn = document.getElementById('mark-complete');
    const shareBtn = document.getElementById('share-story');

    // Get story ID from URL
    const pathParts = window.location.pathname.split('/');
    const storyFilename = pathParts[pathParts.length - 1];
    const storyId = storyFilename.replace('.html', '');

    // Reading state
    let readingState = {
        progress: 0,
        lastPosition: 0,
        totalWords: 0,
        currentWords: 0,
        isBookmarked: false,
        isComplete: false,
        fontSize: 'normal',
        fontFamily: 'default'
    };

    // Initialize story reader
    initStoryReader();

    function initStoryReader() {
        // Load reading progress from localStorage
        loadReadingProgress();

        // Calculate reading progress based on scroll
        calculateTotalWords();
        setupScrollTracking();

        // Setup event listeners
        setupEventListeners();

        // Update UI based on state
        updateUI();

        // Check if story is complete
        checkCompletion();
    }

    function loadReadingProgress() {
        const savedProgress = JSON.parse(localStorage.getItem('opentaleshub_progress')) || {};
        readingState.progress = savedProgress[storyId] || 0;

        const savedBookmarks = JSON.parse(localStorage.getItem('opentaleshub_bookmarks')) || [];
        readingState.isBookmarked = savedBookmarks.includes(storyId);

        // Load reading preferences
        const savedFontSize = localStorage.getItem('opentaleshub_fontsize');
        const savedFontFamily = localStorage.getItem('opentaleshub_fontfamily');

        if (savedFontSize) {
            readingState.fontSize = savedFontSize;
            document.body.classList.add(`${savedFontSize}-text`);
        }

        if (savedFontFamily) {
            readingState.fontFamily = savedFontFamily;
            document.body.classList.add(`${savedFontFamily}-font`);
        }

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem('opentaleshub_darkmode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            if (darkModeBtn) darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Daylight';
        }
    }

    function calculateTotalWords() {
        if (!storyContent) return;

        const text = storyContent.textContent || storyContent.innerText;
        readingState.totalWords = text.split(/\s+/).length;

        // Estimate reading time (200 words per minute)
        const readingMinutes = Math.ceil(readingState.totalWords / 200);

        // Update meta info if element exists
        const readingTimeEl = document.querySelector('.reading-time');
        if (readingTimeEl) {
            readingTimeEl.innerHTML = `<i class="fas fa-hourglass-half"></i> ${readingMinutes} min read`;
        }
    }

    function setupScrollTracking() {
        window.addEventListener('scroll', updateReadingProgress);
        window.addEventListener('resize', updateReadingProgress);

        // Initial update
        setTimeout(updateReadingProgress, 100);
    }

    function updateReadingProgress() {
        if (!storyContent) return;

        const contentRect = storyContent.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the content is visible
        const contentTop = contentRect.top;
        const contentBottom = contentRect.bottom;

        let visibleHeight = 0;

        if (contentTop >= 0 && contentBottom <= windowHeight) {
            // Content fully visible
            visibleHeight = contentRect.height;
        } else if (contentTop < 0 && contentBottom > windowHeight) {
            // Content larger than viewport, partially scrolled
            visibleHeight = windowHeight;
        } else if (contentTop < 0) {
            // Scrolled past the top
            visibleHeight = contentBottom;
        } else if (contentBottom > windowHeight) {
            // Not yet scrolled to bottom
            visibleHeight = windowHeight - contentTop;
        }

        // Calculate percentage
        const percent = Math.min(100, Math.max(0, (visibleHeight / contentRect.height) * 100));

        // Only update if progress increased
        if (percent > readingState.progress) {
            readingState.progress = Math.round(percent);
            saveReadingProgress();
            updateProgressUI();

            // Check if story is complete (scrolled to at least 95%)
            if (readingState.progress >= 95 && !readingState.isComplete) {
                markStoryComplete();
            }
        }
    }

    function updateProgressUI() {
        if (progressFill) {
            progressFill.style.width = `${readingState.progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${readingState.progress}%`;
        }
    }

    function saveReadingProgress() {
        const savedProgress = JSON.parse(localStorage.getItem('opentaleshub_progress')) || {};
        savedProgress[storyId] = readingState.progress;
        localStorage.setItem('opentaleshub_progress', JSON.stringify(savedProgress));

        // Also save as current story
        localStorage.setItem('opentaleshub_current', storyId);
    }

    function setupEventListeners() {
        // Dark mode toggle
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');

                if (isDarkMode) {
                    this.innerHTML = '<i class="fas fa-sun"></i> Daylight';
                } else {
                    this.innerHTML = '<i class="fas fa-moon"></i> Torch';
                }

                localStorage.setItem('opentaleshub_darkmode', isDarkMode);
                showNotification(isDarkMode ? 'Torch lit for reading' : 'Torch extinguished');
            });
        }

        // Large text toggle
        if (largeTextBtn) {
            largeTextBtn.addEventListener('click', function() {
                document.body.classList.toggle('large-text');
                const isLargeText = document.body.classList.contains('large-text');

                if (isLargeText) {
                    this.classList.add('active');
                    readingState.fontSize = 'large';
                } else {
                    this.classList.remove('active');
                    readingState.fontSize = 'normal';
                }

                localStorage.setItem('opentaleshub_fontsize', readingState.fontSize);
                showNotification(isLargeText ? 'Large text enabled' : 'Normal text restored');
            });

            // Set initial state
            if (readingState.fontSize === 'large') {
                largeTextBtn.classList.add('active');
            }
        }

        // Serif font toggle
        if (serifFontBtn) {
            serifFontBtn.addEventListener('click', function() {
                document.body.classList.toggle('serif-font');
                const isSerifFont = document.body.classList.contains('serif-font');

                if (isSerifFont) {
                    this.classList.add('active');
                    readingState.fontFamily = 'serif';
                } else {
                    this.classList.remove('active');
                    readingState.fontFamily = 'default';
                }

                localStorage.setItem('opentaleshub_fontfamily', readingState.fontFamily);
                showNotification(isSerifFont ? 'Serif font enabled' : 'Default font restored');
            });

            // Set initial state
            if (readingState.fontFamily === 'serif') {
                serifFontBtn.classList.add('active');
            }
        }

        // Bookmark toggle
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', toggleBookmark);

            // Set initial state
            updateBookmarkButton();
        }

        // Mark complete button
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', function() {
                markStoryComplete();
                showNotification('Story marked as complete! Achievement unlocked!', 'success');
            });
        }

        // Share button
        if (shareBtn) {
            shareBtn.addEventListener('click', shareStory);
        }

        // Back button
        if (backButton) {
            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                // Save progress before leaving
                saveReadingProgress();
                window.location.href = '../index.html';
            });
        }

        // Navigation buttons
        if (prevButton) {
            prevButton.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToStory('prev');
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToStory('next');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Space bar to scroll
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.scrollBy(0, window.innerHeight * 0.8);
            }

            // Left arrow for previous story
            if (e.code === 'ArrowLeft' && e.altKey) {
                navigateToStory('prev');
            }

            // Right arrow for next story
            if (e.code === 'ArrowRight' && e.altKey) {
                navigateToStory('next');
            }

            // B to toggle bookmark
            if (e.code === 'KeyB' && e.altKey && bookmarkBtn) {
                toggleBookmark();
            }

            // D to toggle dark mode
            if (e.code === 'KeyD' && e.altKey && darkModeBtn) {
                darkModeBtn.click();
            }
        });
    }

    function toggleBookmark() {
        const savedBookmarks = JSON.parse(localStorage.getItem('opentaleshub_bookmarks')) || [];
        const index = savedBookmarks.indexOf(storyId);

        if (index === -1) {
            // Add bookmark
            savedBookmarks.push(storyId);
            readingState.isBookmarked = true;
            showNotification('Story bookmarked!', 'success');
        } else {
            // Remove bookmark
            savedBookmarks.splice(index, 1);
            readingState.isBookmarked = false;
            showNotification('Bookmark removed', 'info');
        }

        localStorage.setItem('opentaleshub_bookmarks', JSON.stringify(savedBookmarks));
        updateBookmarkButton();
    }

    function updateBookmarkButton() {
        if (!bookmarkBtn) return;

        if (readingState.isBookmarked) {
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
            bookmarkBtn.classList.add('active');
        } else {
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
            bookmarkBtn.classList.remove('active');
        }
    }

    function markStoryComplete() {
        readingState.isComplete = true;
        readingState.progress = 100;

        // Save progress
        saveReadingProgress();
        updateProgressUI();

        // Show completion message
        const completionEl = document.querySelector('.story-complete');
        const achievementEl = document.querySelector('.achievement-unlocked');

        if (completionEl) {
            completionEl.textContent = 'Quest Complete!';
        }

        if (achievementEl) {
            achievementEl.style.display = 'block';
        }

        // Update main page stats
        const mainPageProgress = JSON.parse(localStorage.getItem('opentaleshub_progress')) || {};
        mainPageProgress[storyId] = 100;
        localStorage.setItem('opentaleshub_progress', JSON.stringify(mainPageProgress));
    }

    function checkCompletion() {
        if (readingState.progress >= 95) {
            readingState.isComplete = true;

            const completionEl = document.querySelector('.story-complete');
            const achievementEl = document.querySelector('.achievement-unlocked');

            if (completionEl) {
                completionEl.textContent = 'Quest Complete!';
            }

            if (achievementEl) {
                achievementEl.style.display = 'block';
            }
        }
    }

    function shareStory() {
        const storyTitle = document.querySelector('.story-title')?.textContent || 'OpenTalesHub Story';
        const storyUrl = window.location.href;

        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: storyTitle,
                text: `Check out this story on OpenTalesHub: ${storyTitle}`,
                url: storyUrl
            })
            .then(() => showNotification('Story shared successfully!', 'success'))
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${storyTitle} - ${storyUrl}`)
                .then(() => showNotification('Link copied to clipboard!', 'success'))
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    showNotification('Could not share story', 'error');
                });
        }
    }

    function navigateToStory(direction) {
        // Get current story list
        const stories = JSON.parse(localStorage.getItem('opentaleshub_stories')) ||
                       getFallbackStories();

        const currentIndex = stories.findIndex(story => story.id === storyId);

        if (currentIndex === -1) {
            showNotification('Story navigation unavailable', 'error');
            return;
        }

        let targetIndex;

        if (direction === 'prev') {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : stories.length - 1;
        } else { // next
            targetIndex = currentIndex < stories.length - 1 ? currentIndex + 1 : 0;
        }

        const targetStory = stories[targetIndex];

        // Save current progress before navigating
        saveReadingProgress();

        // Navigate to target story
        window.location.href = `../stories/${targetStory.filename}`;
    }

    function getFallbackStories() {
        // Same as in main script
        return [
            { id: 'tell-tale-heart', filename: 'tell-tale-heart.html', title: 'The Tell-Tale Heart' },
            { id: 'the-gift-of-magi', filename: 'the-gift-of-magi.html', title: 'The Gift of the Magi' },
            { id: 'the-lottery', filename: 'the-lottery.html', title

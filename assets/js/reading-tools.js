// Reading Tools and Controls
class ReadingTools {
    constructor() {
        this.init();
    }
    
    init() {
        this.createControls();
        this.setupEventListeners();
    }
    
    createControls() {
        const controlsHTML = `
        <div class="reading-controls" id="readingControls">
            <button class="control-btn" id="font-increase" title="Increase Font Size">
                <span>A+</span>
            </button>
            <button class="control-btn" id="font-decrease" title="Decrease Font Size">
                <span>A-</span>
            </button>
            <button class="control-btn" id="theme-toggle" title="Toggle Theme">
                <span>🌙</span>
            </button>
            <button class="control-btn" id="scroll-top" title="Scroll to Top">
                <span>↑</span>
            </button>
            <button class="control-btn" id="bookmark" title="Bookmark Page">
                <span>🔖</span>
            </button>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', controlsHTML);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
        .reading-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }
        
        .control-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--accent);
            color: var(--bg);
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s;
        }
        
        .control-btn:hover {
            transform: scale(1.1);
            background: #239c73;
        }
        
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: var(--accent);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s;
        }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Scroll to top
        document.getElementById('scroll-top').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Bookmark
        document.getElementById('bookmark').addEventListener('click', () => {
            this.saveBookmark();
        });
        
        // Show/hide on scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const controls = document.getElementById('readingControls');
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                controls.style.opacity = '0.5';
            } else {
                controls.style.opacity = '1';
            }
            lastScroll = currentScroll;
        });
    }
    
    saveBookmark() {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        const scrollPosition = window.scrollY;
        
        const bookmark = {
            title: pageTitle,
            url: pageUrl,
            position: scrollPosition,
            timestamp: new Date().toISOString()
        };
        
        let bookmarks = JSON.parse(localStorage.getItem('opentales-bookmarks') || '[]');
        bookmarks.push(bookmark);
        localStorage.setItem('opentales-bookmarks', JSON.stringify(bookmarks));
        
        this.showNotification('Page bookmarked!');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--accent);
            color: var(--bg);
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ReadingTools();
});

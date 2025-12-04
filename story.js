// Story Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    
    if (savedTheme === 'night') {
        body.classList.add('night-theme');
    } else {
        body.classList.add('day-theme');
    }
    
    // Add back button if not present
    if (!document.querySelector('.back-button')) {
        const backButton = document.createElement('a');
        backButton.href = '../index.html';
        backButton.className = 'back-button';
        backButton.textContent = '← Back to Stories';
        backButton.style.margin = '40px auto';
        backButton.style.display = 'block';
        backButton.style.width = 'fit-content';
        
        const storyContainer = document.querySelector('.story-container');
        if (storyContainer) {
            storyContainer.appendChild(backButton);
        } else {
            document.body.appendChild(backButton);
        }
    }
    
    // Add keyboard shortcut to go back
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            window.history.back();
        }
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add paragraph highlighting on click
    const paragraphs = document.querySelectorAll('.story-content p');
    paragraphs.forEach(p => {
        p.addEventListener('click', function() {
            this.classList.toggle('highlight');
        });
    });
    
    // Add CSS for highlighting
    const style = document.createElement('style');
    style.textContent = `
        .story-content p.highlight {
            background: rgba(255, 209, 102, 0.3);
            transition: background 0.3s ease;
        }
        .night-theme .story-content p.highlight {
            background: rgba(144, 205, 244, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Add reading progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0%';
    progressBar.style.height = '3px';
    progressBar.style.background = '#ffd166';
    progressBar.style.zIndex = '9999';
    progressBar.style.transition = 'width 0.3s ease';
    document.body.appendChild(progressBar);
    
    if (body.classList.contains('night-theme')) {
        progressBar.style.background = '#90cdf4';
    }
    
    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
});

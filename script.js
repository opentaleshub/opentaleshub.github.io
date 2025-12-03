// Load stories from JSON and display
async function loadStories() {
    try {
        const response = await fetch('data/stories.json');
        const data = await response.json();
        displayStories(data.stories);
    } catch (error) {
        console.error('Error loading stories:', error);
        document.getElementById('stories-list').innerHTML = 
            '<div class="error">Error loading stories. Please try again later.</div>';
    }
}

function displayStories(stories) {
    const container = document.getElementById('stories-list');
    
    if (!stories || stories.length === 0) {
        container.innerHTML = '<div class="no-stories">No stories available yet.</div>';
        return;
    }
    
    let html = '';
    
    stories.forEach(story => {
        html += `
        <div class="story-card">
            <img src="${story.cover}" alt="${story.title}" class="story-image">
            <div class="story-content">
                <h3 class="story-title">${story.title}</h3>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                    <span>${story.genre}</span>
                    <span>${story.wordCount} words</span>
                </div>
                <a href="${story.file}" class="read-btn">Read Story</a>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load stories when page loads
document.addEventListener('DOMContentLoaded', loadStories);

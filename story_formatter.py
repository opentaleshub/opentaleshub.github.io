#!/usr/bin/env python3
"""
Open Tales Hub - Enhanced Story Formatter
Converts plain text stories into formatted HTML with interactive metadata input
Usage: python story_formatter.py input.txt
"""

import sys
import os
import re
import json
from datetime import datetime

# HTML Template with your site's design
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Open Tales Hub</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .story-page {{
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .story-header {{
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }}
        
        .story-header h1 {{
            color: var(--accent-color);
            font-size: 2.2rem;
            margin-bottom: 10px;
        }}
        
        .story-header .description {{
            color: var(--text-color);
            opacity: 0.8;
            font-size: 1.1rem;
            margin-bottom: 15px;
        }}
        
        .meta-grid {{
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            color: var(--text-color);
            opacity: 0.7;
            font-size: 0.9rem;
        }}
        
        .meta-item {{
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        
        .story-content {{
            line-height: 1.8;
            font-size: 1.1rem;
        }}
        
        .story-content p {{
            margin-bottom: 1.5rem;
        }}
        
        .chapter-title {{
            color: var(--accent-color);
            margin: 40px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border-color);
        }}
        
        .quote {{
            font-style: italic;
            color: var(--accent-color);
            padding-left: 20px;
            border-left: 3px solid var(--accent-color);
            margin: 30px 0;
            padding: 20px;
            background: rgba(108, 99, 255, 0.05);
            border-radius: 5px;
        }}
        
        .content-container {{
            padding: 30px;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 30px;
        }}
        
        /* Reading Controls */
        .reading-controls {{
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 100;
        }}
        
        .control-btn {{
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: var(--accent-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            box-shadow: 0 4px 12px var(--shadow);
            transition: transform 0.2s;
        }}
        
        .control-btn:hover {{
            transform: scale(1.1);
            background: var(--accent-light);
        }}
        
        .back-to-home {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 30px;
            transition: all 0.3s;
        }}
        
        .back-to-home:hover {{
            background: var(--accent-light);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px var(--shadow);
        }}
        
        /* Progress Bar */
        .reading-progress {{
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: var(--accent-color);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s;
        }}
        
        /* Word Count */
        .word-count {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card-bg);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            border: 1px solid var(--border-color);
            opacity: 0.7;
        }}
        
        @media (max-width: 768px) {{
            .story-page {{
                padding: 15px;
            }}
            
            .story-header h1 {{
                font-size: 1.8rem;
            }}
            
            .content-container {{
                padding: 20px;
            }}
            
            .reading-controls {{
                bottom: 15px;
                left: 15px;
            }}
            
            .word-count {{
                bottom: 15px;
                right: 15px;
                font-size: 0.8rem;
            }}
        }}
    </style>
</head>
<body class="dark-theme">
    <!-- Theme Toggle -->
    <button class="theme-toggle" id="themeToggle" title="Toggle theme">
        <i class="fas fa-moon"></i>
    </button>
    
    <!-- Reading Progress Bar -->
    <div class="reading-progress" id="readingProgress"></div>
    
    <!-- Story Content -->
    <div class="story-page">
        <!-- Header -->
        <header class="story-header">
            <h1>{title}</h1>
            <p class="description">{description}</p>
            <div class="meta-grid">
                <div class="meta-item">
                    <i class="fas fa-user"></i>
                    <span>{author}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-book"></i>
                    <span>{genre}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>{reading_time} min read</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>{year}</span>
                </div>
            </div>
        </header>
        
        <!-- Story Container -->
        <div class="content-container">
            <div class="story-content" id="storyContent">
                {content}
            </div>
        </div>
        
        <!-- Back to Home Button -->
        <div style="text-align: center;">
            <a href="../index.html" class="back-to-home">
                <i class="fas fa-arrow-left"></i> Back to All Stories
            </a>
        </div>
    </div>
    
    <!-- Reading Controls -->
    <div class="reading-controls">
        <button class="control-btn" id="fontIncrease" title="Increase Font Size">
            <i class="fas fa-plus"></i>
        </button>
        <button class="control-btn" id="fontDecrease" title="Decrease Font Size">
            <i class="fas fa-minus"></i>
        </button>
        <button class="control-btn" id="scrollTop" title="Scroll to Top">
            <i class="fas fa-arrow-up"></i>
        </button>
    </div>
    
    <!-- Word Count -->
    <div class="word-count" id="wordCount">0 words read</div>
    
    <script>
        // Theme Management
        class StoryThemeManager {{
            constructor() {{
                this.themeToggle = document.getElementById('themeToggle');
                this.init();
            }}
            
            init() {{
                // Load saved theme or default to dark
                const savedTheme = localStorage.getItem('opentales-theme') || 'dark';
                this.setTheme(savedTheme);
                
                // Setup toggle button
                if (this.themeToggle) {{
                    this.themeToggle.addEventListener('click', () => this.toggleTheme());
                }}
            }}
            
            setTheme(theme) {{
                document.body.className = theme + '-theme';
                localStorage.setItem('opentales-theme', theme);
                
                // Update button icon
                if (this.themeToggle) {{
                    const icon = this.themeToggle.querySelector('i');
                    if (icon) {{
                        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
                    }}
                    this.themeToggle.setAttribute('title', 
                        `Switch to ${{theme === 'dark' ? 'light' : 'dark'}} theme`);
                }}
            }}
            
            toggleTheme() {{
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            }}
        }}
        
        // Font Size Control
        class FontSizeManager {{
            constructor() {{
                this.fontSize = 16; // Base font size
                this.contentElement = document.getElementById('storyContent');
                this.increaseBtn = document.getElementById('fontIncrease');
                this.decreaseBtn = document.getElementById('fontDecrease');
                this.init();
            }}
            
            init() {{
                // Load saved font size
                const savedSize = localStorage.getItem('opentales-fontsize');
                if (savedSize) {{
                    this.fontSize = parseInt(savedSize);
                    this.applyFontSize();
                }}
                
                // Setup event listeners
                if (this.increaseBtn) {{
                    this.increaseBtn.addEventListener('click', () => this.increaseFont());
                }}
                
                if (this.decreaseBtn) {{
                    this.decreaseBtn.addEventListener('click', () => this.decreaseFont());
                }}
            }}
            
            increaseFont() {{
                if (this.fontSize < 24) {{
                    this.fontSize += 1;
                    this.applyFontSize();
                    this.saveFontSize();
                }}
            }}
            
            decreaseFont() {{
                if (this.fontSize > 12) {{
                    this.fontSize -= 1;
                    this.applyFontSize();
                    this.saveFontSize();
                }}
            }}
            
            applyFontSize() {{
                if (this.contentElement) {{
                    this.contentElement.style.fontSize = this.fontSize + 'px';
                }}
            }}
            
            saveFontSize() {{
                localStorage.setItem('opentales-fontsize', this.fontSize);
            }}
        }}
        
        // Reading Progress and Position
        class ReadingTracker {{
            constructor() {{
                this.progressBar = document.getElementById('readingProgress');
                this.wordCountElement = document.getElementById('wordCount');
                this.storyId = window.location.pathname.split('/').pop();
                this.init();
            }}
            
            init() {{
                // Setup scroll tracking
                window.addEventListener('scroll', () => this.updateProgress());
                
                // Load saved position
                this.loadPosition();
                
                // Calculate word count
                this.calculateWordCount();
                
                // Save position on scroll
                let saveTimeout;
                window.addEventListener('scroll', () => {{
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => this.savePosition(), 1000);
                }});
                
                // Setup scroll to top
                const scrollTopBtn = document.getElementById('scrollTop');
                if (scrollTopBtn) {{
                    scrollTopBtn.addEventListener('click', () => {{
                        window.scrollTo({{ top: 0, behavior: 'smooth' }});
                    }});
                }}
            }}
            
            updateProgress() {{
                if (!this.progressBar) return;
                
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                
                this.progressBar.style.width = scrolled + '%';
                
                // Update word count
                this.updateWordCount();
            }}
            
            calculateWordCount() {{
                const contentElement = document.getElementById('storyContent');
                if (!contentElement) return;
                
                const text = contentElement.textContent || '';
                const words = text.split(/\\s+/).filter(word => word.length > 0);
                this.totalWords = words.length;
                
                // Update word count display
                this.updateWordCount();
            }}
            
            updateWordCount() {{
                if (!this.wordCountElement || !this.totalWords) return;
                
                const contentElement = document.getElementById('storyContent');
                if (!contentElement) return;
                
                // Estimate words read based on scroll position
                const scrollPercent = (window.scrollY + window.innerHeight) / 
                                     document.documentElement.scrollHeight;
                const wordsRead = Math.min(
                    Math.floor(this.totalWords * scrollPercent),
                    this.totalWords
                );
                
                this.wordCountElement.textContent = 
                    `${{wordsRead.toLocaleString()}} of ${{this.totalWords.toLocaleString()}} words`;
            }}
            
            savePosition() {{
                const position = window.scrollY;
                localStorage.setItem(`reading-${{this.storyId}}`, position);
            }}
            
            loadPosition() {{
                const savedPosition = localStorage.getItem(`reading-${{this.storyId}}`);
                if (savedPosition) {{
                    setTimeout(() => {{
                        window.scrollTo(0, parseInt(savedPosition));
                    }}, 100);
                }}
            }}
        }}
        
        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', () => {{
            // Initialize theme manager
            new StoryThemeManager();
            
            // Initialize font size manager
            new FontSizeManager();
            
            // Initialize reading tracker
            new ReadingTracker();
            
            // Add keyboard shortcuts
            document.addEventListener('keydown', (e) => {{
                // Ctrl/Cmd + Plus to increase font
                if ((e.ctrlKey || e.metaKey) && e.key === '=') {{
                    e.preventDefault();
                    document.getElementById('fontIncrease')?.click();
                }}
                
                // Ctrl/Cmd + Minus to decrease font
                if ((e.ctrlKey || e.metaKey) && e.key === '-') {{
                    e.preventDefault();
                    document.getElementById('fontDecrease')?.click();
                }}
                
                // Escape to toggle theme
                if (e.key === 'Escape') {{
                    document.getElementById('themeToggle')?.click();
                }}
            }});
        }});
    </script>
</body>
</html>'''

def clear_screen():
    """Clear terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print script header."""
    clear_screen()
    print("=" * 60)
    print("📖 OPEN TALES HUB - ENHANCED STORY FORMATTER 📖")
    print("=" * 60)
    print("Convert text files to beautiful story pages with theme toggle")
    print("=" * 60)

def format_content(text):
    """Convert plain text to formatted HTML with paragraphs and chapters."""
    
    # Split the text into lines
    lines = text.strip().split('\n')
    
    formatted_lines = []
    in_paragraph = False
    current_paragraph = []
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines
        if not line:
            if in_paragraph:
                # End current paragraph
                paragraph_text = ' '.join(current_paragraph)
                formatted_lines.append(f'<p>{paragraph_text}</p>')
                current_paragraph = []
                in_paragraph = False
            continue
        
        # Check if this line is a chapter heading
        chapter_patterns = [
            r'^CHAPTER\s+[IVXLCDM0-9]+',
            r'^Chapter\s+[0-9]+',
            r'^Part\s+[IVXLCDM0-9]+',
            r'^[IVXLCDM]+\.',  # Roman numerals followed by period
            r'^[0-9]+\.',      # Numbers followed by period
            r'^Book\s+[IVXLCDM0-9]+',
            r'^Section\s+[IVXLCDM0-9]+',
        ]
        
        is_chapter = False
        for pattern in chapter_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                is_chapter = True
                break
        
        # Also check for all caps and reasonable length (likely a chapter title)
        if not is_chapter and line.isupper() and 10 < len(line) < 100:
            is_chapter = True
        
        # Check for centered chapter titles (common in some texts)
        if not is_chapter and line.startswith(' ') and line.endswith(' '):
            trimmed = line.strip()
            if trimmed.isupper() and len(trimmed) < 100:
                is_chapter = True
                line = trimmed
        
        if is_chapter:
            # If we were in a paragraph, end it first
            if in_paragraph:
                paragraph_text = ' '.join(current_paragraph)
                formatted_lines.append(f'<p>{paragraph_text}</p>')
                current_paragraph = []
                in_paragraph = False
            
            # Add chapter title
            formatted_lines.append(f'<h3 class="chapter-title">{line}</h3>')
        
        # Check if line is a quote (starts with quote mark or is dialogue)
        elif (line.startswith('"') or line.startswith("'") or 
              (line.startswith('"') and line.endswith('"'))):
            # If we were in a paragraph, end it first
            if in_paragraph:
                paragraph_text = ' '.join(current_paragraph)
                formatted_lines.append(f'<p>{paragraph_text}</p>')
                current_paragraph = []
                in_paragraph = False
            
            # Add as quote
            formatted_lines.append(f'<div class="quote">{line}</div>')
        
        # Check for thought/monologue (italicized in original)
        elif line.startswith('_') and line.endswith('_'):
            if in_paragraph:
                paragraph_text = ' '.join(current_paragraph)
                formatted_lines.append(f'<p>{paragraph_text}</p>')
                current_paragraph = []
                in_paragraph = False
            
            # Remove underscores and add as quote
            clean_line = line.strip('_')
            formatted_lines.append(f'<div class="quote"><i>{clean_line}</i></div>')
        
        else:
            # Regular text line - add to current paragraph
            current_paragraph.append(line)
            in_paragraph = True
    
    # Don't forget the last paragraph
    if current_paragraph:
        paragraph_text = ' '.join(current_paragraph)
        formatted_lines.append(f'<p>{paragraph_text}</p>')
    
    # Join all formatted lines
    return '\n'.join(formatted_lines)

def count_words(text):
    """Count words in text."""
    words = re.findall(r'\b\w+\b', text)
    return len(words)

def estimate_reading_time(word_count):
    """Estimate reading time (average reading speed: 200 words per minute)."""
    minutes = word_count // 200
    if minutes < 1:
        return 1
    return minutes

def get_genre_suggestions():
    """Return genre suggestions."""
    return [
        "Fantasy", "Mystery", "Science Fiction", "Horror",
        "Romance", "Classic Literature", "Adventure", "Drama",
        "Thriller", "Historical Fiction", "Young Adult", "Poetry",
        "Biography", "Philosophy", "Short Story", "Fairy Tale"
    ]

def get_cover_suggestions(genre):
    """Get cover image suggestions based on genre."""
    
    cover_images = {
        "Fantasy": [
            ("Dragon & Castle", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&fit=crop"),
            ("Magic Forest", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&fit=crop"),
            ("Ancient Ruins", "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&fit=crop")
        ],
        "Mystery": [
            ("Detective", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop"),
            ("Dark Alley", "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&fit=crop"),
            ("Magnifying Glass", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&fit=crop")
        ],
        "Science Fiction": [
            ("Space", "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&fit=crop"),
            ("Futuristic City", "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=500&fit=crop"),
            ("Alien Planet", "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&fit=crop")
        ],
        "Horror": [
            ("Creepy House", "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&fit=crop"),
            ("Dark Shadows", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&fit=crop"),
            ("Gothic", "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=500&fit=crop")
        ],
        "Romance": [
            ("Couple", "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=500&fit=crop"),
            ("Love Letters", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&fit=crop"),
            ("Sunset", "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&fit=crop")
        ],
        "Classic Literature": [
            ("Old Books", "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&fit=crop"),
            ("Quill & Ink", "https://images.unsplash.com/photo-1531346688376-ab6275c4725e?w=500&fit=crop"),
            ("Library", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&fit=crop")
        ],
        "default": [
            ("Open Book", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&fit=crop"),
            ("Bookshelf", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop"),
            ("Reading", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&fit=crop")
        ]
    }
    
    # Try to match genre
    for key, images in cover_images.items():
        if key.lower() in genre.lower():
            return images
    
    return cover_images["default"]

def interactive_metadata_input(input_file):
    """Get metadata interactively from user."""
    
    print_header()
    print(f"\n📄 Input File: {os.path.basename(input_file)}")
    print("-" * 60)
    
    # Preview first few lines
    with open(input_file, 'r', encoding='utf-8') as f:
        preview = f.read(1000)
    
    lines = preview.strip().split('\n')
    
    print("\n📖 Text Preview (first 10 lines):")
    print("-" * 40)
    for i, line in enumerate(lines[:10]):
        print(f"{i+1:2}: {line[:80]}{'...' if len(line) > 80 else ''}")
    print("-" * 40)
    
    # Get metadata
    print("\n📝 ENTER STORY METADATA")
    print("-" * 40)
    
    # Try to auto-detect title from first line
    auto_title = lines[0].strip() if lines else "Untitled Story"
    if len(auto_title) > 100:  # If first line is too long, it's probably not title
        auto_title = "Untitled Story"
    
    # Title
    while True:
        title = input(f"\n📌 Story Title [{auto_title}]: ").strip()
        if not title:
            title = auto_title
        if title:
            break
        print("⚠️  Title cannot be empty!")
    
    # Author
    print("\n✍️  Author Information")
    print("   Examples: 'Leo Tolstoy', 'flharia', 'Edgar Allan Poe'")
    while True:
        author = input(f"\n📝 Author Name [Unknown Author]: ").strip()
        if not author:
            author = "Unknown Author"
        if author:
            break
        print("⚠️  Author cannot be empty!")
    
    # Genre
    print("\n🏷️  Choose a Genre")
    print("-" * 40)
    genres = get_genre_suggestions()
    for i, genre in enumerate(genres, 1):
        print(f"  {i:2}. {genre}")
    print("-" * 40)
    
    while True:
        genre_input = input(f"\n📚 Genre (enter number or name) [Fantasy]: ").strip()
        if not genre_input:
            genre = "Fantasy"
            break
        
        # Check if input is a number
        if genre_input.isdigit():
            idx = int(genre_input) - 1
            if 0 <= idx < len(genres):
                genre = genres[idx]
                break
            else:
                print(f"⚠️  Please enter a number between 1 and {len(genres)}")
        else:
            # User entered a genre name
            genre = genre_input
            break
    
    # Description
    print("\n📄 Story Description")
    print("   A brief summary (1-2 sentences) that will appear on the homepage")
    auto_desc = preview[:150] + "..." if len(preview) > 150 else preview
    description = input(f"\n📝 Description [{auto_desc}]: ").strip()
    if not description:
        description = auto_desc
    
    # Year
    current_year = datetime.now().year
    while True:
        year_input = input(f"\n📅 Year of Publication [{current_year}]: ").strip()
        if not year_input:
            year = current_year
            break
        
        if year_input.isdigit() and 1000 <= int(year_input) <= current_year:
            year = year_input
            break
        else:
            print(f"⚠️  Please enter a valid year (1000-{current_year})")
    
    # Cover Image
    print("\n🖼️  Cover Image")
    print("-" * 40)
    print("We'll suggest images based on the genre. You can:")
    print("  1. Choose from our suggestions")
    print("  2. Enter your own Unsplash URL")
    print("  3. Use default book image")
    print("-" * 40)
    
    # Get suggestions for this genre
    suggestions = get_cover_suggestions(genre)
    
    print(f"\n📸 Suggested images for '{genre}':")
    for i, (desc, url) in enumerate(suggestions, 1):
        print(f"  {i}. {desc}")
        print(f"     {url}")
    
    while True:
        print(f"\n🖼️  Cover Image Options:")
        print("  1-3: Choose from suggestions above")
        print("  4: Enter custom Unsplash URL")
        print("  5: Use default book image")
        
        choice = input(f"\n👉 Your choice (1-5) [1]: ").strip()
        if not choice:
            choice = "1"
        
        if choice == "1":
            cover = suggestions[0][1]
            break
        elif choice == "2":
            cover = suggestions[1][1]
            break
        elif choice == "3":
            cover = suggestions[2][1]
            break
        elif choice == "4":
            cover = input("\n🔗 Enter Unsplash URL: ").strip()
            if cover and cover.startswith("https://images.unsplash.com/"):
                break
            else:
                print("⚠️  Please enter a valid Unsplash URL")
                continue
        elif choice == "5":
            cover = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&fit=crop"
            break
        else:
            print("⚠️  Please enter 1, 2, 3, 4, or 5")
    
    # Filename
    print("\n💾 Output File")
    safe_title = re.sub(r'[^a-zA-Z0-9]', '-', title).lower()
    safe_title = re.sub(r'-+', '-', safe_title)  # Remove multiple dashes
    default_filename = f"{safe_title}.html"
    
    while True:
        filename = input(f"\n📁 Output filename [{default_filename}]: ").strip()
        if not filename:
            filename = default_filename
        
        # Ensure .html extension
        if not filename.endswith('.html'):
            filename += '.html'
        
        # Check if file exists
        if os.path.exists(filename):
            overwrite = input(f"⚠️  File '{filename}' exists. Overwrite? (y/N): ").strip().lower()
            if overwrite != 'y':
                continue
        
        break
    
    # Summary
    print_header()
    print("\n✅ STORY METADATA SUMMARY")
    print("-" * 60)
    print(f"📌 Title:       {title}")
    print(f"✍️  Author:      {author}")
    print(f"🏷️  Genre:       {genre}")
    print(f"📄 Description: {description[:80]}...")
    print(f"📅 Year:        {year}")
    print(f"🖼️  Cover:       {cover[:50]}...")
    print(f"💾 Output:      {filename}")
    print("-" * 60)
    
    confirm = input("\n✅ Everything correct? Press Enter to proceed, or 'n' to cancel: ").strip().lower()
    
    if confirm == 'n':
        print("\n❌ Cancelled by user.")
        sys.exit(0)
    
    return {
        'title': title,
        'author': author,
        'genre': genre,
        'description': description,
        'year': year,
        'cover': cover,
        'filename': filename
    }

def create_html_story(input_file, metadata):
    """Create HTML story from text file and metadata."""
    
    print("\n🔄 Processing story text...")
    
    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Calculate word count and reading time
    word_count = count_words(content)
    reading_time = estimate_reading_time(word_count)
    
    print(f"📊 Word count: {word_count:,}")
    print(f"⏱️  Reading time: {reading_time} minutes")
    
    # Format the content
    formatted_content = format_content(content)
    
    # Prepare template variables
    template_vars = {
        'title': metadata['title'],
        'author': metadata['author'],
        'genre': metadata['genre'],
        'description': metadata['description'],
        'year': metadata['year'],
        'reading_time': reading_time,
        'content': formatted_content,
    }
    
    # Generate HTML
    html_output = HTML_TEMPLATE.format(**template_vars)
    
    # Write output file
    with open(metadata['filename'], 'w', encoding='utf-8') as f:
        f.write(html_output)
    
    print(f"\n✅ Successfully created: {metadata['filename']}")
    
    # Generate JSON entry
    json_entry = generate_json_entry(metadata, word_count)
    
    return json_entry

def generate_json_entry(metadata, word_count):
    """Generate JSON entry for stories.json."""
    
    # Create story ID from filename (without .html)
    story_id = os.path.splitext(metadata['filename'])[0]
    
    json_entry = {
        "id": story_id,
        "title": metadata['title'],
        "description": metadata['description'],
        "author": metadata['author'],
        "genre": metadata['genre'],
        "cover": metadata['cover'],
        "file": f"stories/{metadata['filename']}",
        "wordCount": word_count
    }
    
    return json_entry

def print_json_output(json_entry):
    """Print JSON entry in a user-friendly format."""
    
    print("\n" + "=" * 60)
    print("📋 JSON ENTRY FOR data/stories.json")
    print("=" * 60)
    print("\n📝 Copy this entry and add it to your data/stories.json file:")
    print("-" * 60)
    
    # Pretty print JSON
    json_str = json.dumps(json_entry, indent=4, ensure_ascii=False)
    
    # Split into lines and add proper formatting
    lines = json_str.split('\n')
    for i, line in enumerate(lines):
        if i == 0:
            print("    " + line)
        elif i == len(lines) - 1:
            print("    " + line)
        else:
            print("    " + line)
    
    print("-" * 60)
    
    # Also show exact line to add
    print("\n💡 Where to add it in data/stories.json:")
    print("   Find the 'stories' array and add this entry:")
    print("   ```json")
    print('   "stories": [')
    print('     ...existing entries...,')
    print(f'     {json.dumps(json_entry, ensure_ascii=False)}')
    print('   ]')
    print("   ```")

def print_final_instructions(metadata):
    """Print final instructions for the user."""
    
    print("\n" + "=" * 60)
    print("🎉 STORY CREATION COMPLETE!")
    print("=" * 60)
    
    print("\n📁 NEXT STEPS:")
    print("1. Move the HTML file to stories/ folder:")
    print(f"   mv {metadata['filename']} stories/")
    print("\n2. Add the JSON entry to data/stories.json")
    print("\n3. Test the story locally:")
    print(f"   xdg-open stories/{metadata['filename']}")
    print("\n4. Commit and push to GitHub:")
    print(f"   git add stories/{metadata['filename']} data/stories.json")
    print(f"   git commit -m 'Added new story: {metadata['title']}'")
    print("   git push origin main")
    print("\n5. Wait 1-2 minutes and check your site:")
    print("   https://opentaleshub.github.io")
    print("=" * 60)

def main():
    """Main function."""
    
    # Check command line arguments
    if len(sys.argv) != 2:
        print("❌ ERROR: Text file is required!")
        print("\nUsage:")
        print(f"  python {sys.argv[0]} story.txt")
        print("\nExample:")
        print(f"  python {sys.argv[0]} telltale.txt")
        print(f"  python {sys.argv[0]} gift-of-magi.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(input_file):
        print(f"❌ ERROR: File '{input_file}' not found!")
        sys.exit(1)
    
    try:
        # Get metadata interactively
        metadata = interactive_metadata_input(input_file)
        
        # Create HTML story
        json_entry = create_html_story(input_file, metadata)
        
        # Show JSON output
        print_json_output(json_entry)
        
        # Show final instructions
        print_final_instructions(metadata)
        
    except KeyboardInterrupt:
        print("\n\n❌ Process interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

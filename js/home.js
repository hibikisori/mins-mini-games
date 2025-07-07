/**
 * Home page interactive category filtering
 * Handles category legend clicks and game card highlighting
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all category items and game cards
    const categoryItems = document.querySelectorAll('.category-item');
    const gameCards = document.querySelectorAll('.game-card');
    
    // Category mappings
    const categoryMap = {
        'brain': 'brain-game',
        'action': 'action-game', 
        'strategy': 'strategy-game',
        'puzzle': 'puzzle-game'
    };
    
    // Add click handlers to category items
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryClass = this.classList[1]; // Get the category class (brain, action, etc.)
            const gameClass = categoryMap[categoryClass];
            
            // Check if this category is already active
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                // Remove active state from category
                this.classList.remove('active');
                
                // Remove highlight from all game cards
                gameCards.forEach(card => {
                    card.classList.remove('highlighted');
                });
            } else {
                // First, remove active state from all categories
                categoryItems.forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Remove highlight from all game cards
                gameCards.forEach(card => {
                    card.classList.remove('highlighted');
                });
                
                // Add active state to clicked category
                this.classList.add('active');
                
                // Highlight matching game cards
                gameCards.forEach(card => {
                    if (card.classList.contains(gameClass)) {
                        card.classList.add('highlighted');
                    }
                });
            }
        });
        
        // Add hover effects for better UX
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Add keyboard navigation support
    categoryItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Filter by ${item.textContent.trim()}`);
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Optional: Add a "Show All" functionality when clicking outside categories
    document.addEventListener('click', function(e) {
        // Check if click is outside category legend
        const categoryLegend = document.querySelector('.category-legend');
        if (!categoryLegend.contains(e.target)) {
            // Remove active state from all categories
            categoryItems.forEach(cat => {
                cat.classList.remove('active');
            });
            
            // Remove highlight from all game cards
            gameCards.forEach(card => {
                card.classList.remove('highlighted');
            });
        }
    });
});

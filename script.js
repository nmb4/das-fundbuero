/**
 * Fundbüro — Main JavaScript
 * Handles uploads, filtering, modals, and item display
 */

// Sample initial items
const initialItems = [
    {
        id: 1,
        title: "Schwarzer Rucksack",
        category: "accessories",
        location: "Mensa Hauptgebäude",
        description: "Schwarzer Laptop-Rucksack mit grauen Details. Enthält ein MacBook Ladekabel und ein Notizbuch.",
        image: null,
        date: "2025-03-25",
        status: "available"
    },
    {
        id: 2,
        title: "iPhone 13 Pro",
        category: "electronics",
        location: "Hörsaal 3A",
        description: "Graphitfarbenes iPhone mit schwarzer Hülle. Display hat einen kleinen Kratzer oben rechts.",
        image: null,
        date: "2025-03-24",
        status: "available"
    },
    {
        id: 3,
        title: "Blaue Wollmütze",
        category: "clothing",
        location: "Bibliothek, 2. Stock",
        description: "Dunkelblaue Strickmütze mit einem kleinen Pompon.",
        image: null,
        date: "2025-03-24",
        status: "available"
    },
    {
        id: 4,
        title: "Studentenausweis",
        category: "documents",
        location: "Café Campus",
        description: "Uni-Ausweis, Name ist unleserlich. Gültig bis 2026.",
        image: null,
        date: "2025-03-23",
        status: "available"
    },
    {
        id: 5,
        title: "AirPods Pro",
        category: "electronics",
        location: "Sportzentrum",
        description: "Weißes Case, leicht verkratzt. Finde ich im Umkleidebereich.",
        image: null,
        date: "2025-03-23",
        status: "available"
    },
    {
        id: 6,
        title: "Thermosflasche",
        category: "other",
        location: "Park vor der Mensa",
        description: "Edelstahl Thermoskanne, ca. 500ml. Mit Aufklebern von verschiedenen Reisen.",
        image: null,
        date: "2025-03-22",
        status: "available"
    },
    {
        id: 7,
        title: "Brille mit Etui",
        category: "accessories",
        location: "Hörsaal B12",
        description: "Schwarze Fassung, eckige Gläser. Etui ist braunes Lederimitat.",
        image: null,
        date: "2025-03-21",
        status: "available"
    },
    {
        id: 8,
        title: "Nike Hoodie Grau",
        category: "clothing",
        location: "Turnhalle",
        description: "Graue Nike Sweatshirt, Größe M. Auf dem Ärmel ein kleiner Kaffeefleck.",
        image: null,
        date: "2025-03-21",
        status: "available"
    }
];

// Category display names
const categoryNames = {
    electronics: "Elektronik",
    accessories: "Accessoires",
    clothing: "Kleidung",
    documents: "Dokumente",
    other: "Sonstiges"
};

// Category emojis for placeholder
const categoryEmojis = {
    electronics: "💻",
    accessories: "👜",
    clothing: "👕",
    documents: "📄",
    other: "📦"
};

// State
let items = JSON.parse(localStorage.getItem('fundbuero_items')) || initialItems;
let currentFilter = 'all';
let currentSearch = '';
let finderMode = localStorage.getItem('fundbuero_finder_mode') === 'true';

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const uploadModal = document.getElementById('uploadModal');
const detailModal = document.getElementById('detailModal');
const claimModal = document.getElementById('claimModal');
const detailContent = document.getElementById('detailContent');
const imageInput = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
const searchInput = document.getElementById('headerSearch');
const filterButtons = document.querySelectorAll('#headerFilters .filter-btn');

// Initialize
function init() {
    renderItems();
    setupEventListeners();
    animateOnScroll();
}

// Render items grid
function renderItems() {
    const filteredItems = items.filter(item => {
        const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
        const matchesSearch = currentSearch === '' ||
            item.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            item.location.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">Keine Fundsachen gefunden</h3>
                <p class="empty-text">Probiere eine andere Suche oder melde einen neuen Fund!</p>
            </div>
        `;
        return;
    }

    itemsGrid.innerHTML = filteredItems.map(item => createItemCard(item)).join('');

    // Add click handlers to cards
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => openDetailModal(parseInt(card.dataset.id)));
    });
}

// Create item card HTML
function createItemCard(item) {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });

    const imageHtml = item.image
        ? `<img src="${item.image}" alt="${item.title}" class="item-image">`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem;">${categoryEmojis[item.category]}</div>`;

    const isReturned = item.status === 'returned';
    const statusText = isReturned ? 'Zurückgegeben' : 'Aktiv';
    const statusClass = isReturned ? 'item-status item-status--returned' : 'item-status';
    const cardClass = isReturned ? 'item-card item-card--returned' : 'item-card';

    return `
        <article class="${cardClass}" data-id="${item.id}">
            <div class="item-image-container">
                ${imageHtml}
                <span class="item-category-badge">${categoryNames[item.category]}</span>
            </div>
            <div class="item-content">
                <h3 class="item-title">${item.title}</h3>
                <div class="item-location">${item.location}</div>
                <div class="item-meta">
                    <span class="item-date">${dateStr}</span>
                    <span class="${statusClass}">${statusText}</span>
                </div>
            </div>
        </article>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Image upload preview
    imageInput.addEventListener('change', handleImagePreview);

    // Search
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderItems();
    });

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderItems();
        });
    });

    // Finder mode toggle
    const finderModeSwitch = document.getElementById('finderModeSwitch');
    finderModeSwitch.checked = finderMode;
    finderModeSwitch.addEventListener('change', (e) => {
        finderMode = e.target.checked;
        localStorage.setItem('fundbuero_finder_mode', finderMode);
        renderItems();
        showToast(finderMode ? '🔍 Finder-Modus aktiviert' : 'Finder-Modus deaktiviert', 2500);
    });

    // Close modals on overlay click
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeUploadModal();
    });

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
    });

    claimModal.addEventListener('click', (e) => {
        if (e.target === claimModal) closeClaimModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUploadModal();
            closeDetailModal();
            closeClaimModal();
        }
    });

    // Drag and drop for image upload
    const uploadArea = document.getElementById('imageUpload');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-primary)';
        uploadArea.style.background = 'var(--color-primary-soft)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            imageInput.files = e.dataTransfer.files;
            handleImagePreview();
        }
    });
}

// Handle image preview
function handleImagePreview() {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
}

// Remove uploaded image
function removeUploadedImage(e) {
    e.stopPropagation();
    imageInput.value = '';
    imagePreview.src = '';
    imagePreview.classList.remove('active');
}

// Modal functions
function openUploadModal() {
    uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
    uploadModal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('uploadForm').reset();
    removeUploadedImage({ stopPropagation: () => {} });
}

function openDetailModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

    const imageHtml = item.image
        ? `<div class="detail-image-container"><img src="${item.image}" alt="${item.title}" class="detail-image"></div>`
        : `<div class="detail-image-container" style="display: flex; align-items: center; justify-content: center; font-size: 6rem; min-height: 280px;">${categoryEmojis[item.category]}</div>`;

    const isReturned = item.status === 'returned';

    // Generate different buttons based on finder mode and item status
    let actionButtons = '';

    if (finderMode) {
        // Finder mode: show mark as returned/unmark buttons
        if (isReturned) {
            actionButtons = `
                <button class="btn-secondary" onclick="unmarkAsReturned(${item.id})">
                    ↩️ Wieder verfügbar
                </button>
                <button class="btn-secondary" onclick="shareItem(${item.id})">
                    Teilen
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn-primary btn-primary--returned" onclick="markAsReturned(${item.id})">
                    ✅ Als zurückgegeben markieren
                </button>
                <button class="btn-secondary" onclick="shareItem(${item.id})">
                    Teilen
                </button>
            `;
        }
    } else {
        // Normal mode: show claim button (unless returned)
        if (isReturned) {
            actionButtons = `
                <button class="btn-secondary btn-secondary--disabled" disabled>
                    🎁 Bereits zurückgegeben
                </button>
                <button class="btn-secondary" onclick="shareItem(${item.id})">
                    Teilen
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn-primary" onclick="claimItem(${item.id})">
                    Das ist meins! 🎉
                </button>
                <button class="btn-secondary" onclick="shareItem(${item.id})">
                    Teilen
                </button>
            `;
        }
    }

    detailContent.innerHTML = `
        ${imageHtml}
        <div class="detail-info">
            <span class="detail-category">${categoryNames[item.category]}</span>
            <h2 class="detail-title">${item.title}</h2>

            <div class="detail-meta">
                <div class="meta-row">
                    <span class="meta-icon">📍</span>
                    <div class="meta-content">
                        <span class="meta-label">Fundort</span>
                        <span class="meta-value">${item.location}</span>
                    </div>
                </div>
                <div class="meta-row">
                    <span class="meta-icon">📅</span>
                    <div class="meta-content">
                        <span class="meta-label">Gefunden am</span>
                        <span class="meta-value">${dateStr}</span>
                    </div>
                </div>
                ${isReturned ? `
                    <div class="meta-row">
                        <span class="meta-icon">✅</span>
                        <div class="meta-content">
                            <span class="meta-label">Status</span>
                            <span class="meta-value" style="color: var(--color-accent);">Zurückgegeben</span>
                        </div>
                    </div>
                ` : ''}
            </div>

            ${item.description ? `
                <div class="detail-description">
                    <p>${item.description}</p>
                </div>
            ` : ''}

            ${finderMode ? `
                <div class="finder-mode-indicator">
                    <span class="finder-badge">🔍 Finder-Modus</span>
                    <p class="finder-hint">Du siehst diese Aktionen, weil du im Finder-Modus bist.</p>
                </div>
            ` : ''}

            <div class="detail-actions">
                ${actionButtons}
            </div>
        </div>
    `;

    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    detailModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle upload form submission
function handleUpload(e) {
    e.preventDefault();

    const file = imageInput.files[0];
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('itemCategory').value;
    const location = document.getElementById('itemLocation').value;
    const description = document.getElementById('itemDescription').value;

    let imageData = null;

    const saveItem = () => {
        const newItem = {
            id: Date.now(),
            title,
            category,
            location,
            description,
            image: imageData,
            date: new Date().toISOString().split('T')[0],
            status: 'available'
        };

        items.unshift(newItem);
        localStorage.setItem('fundbuero_items', JSON.stringify(items));

        renderItems();
        closeUploadModal();

        // Show success message
        showToast('Dein Fund ist jetzt für alle sichtbar.', 3500);

        // Scroll to items
        document.getElementById('items').scrollIntoView({ behavior: 'smooth' });
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageData = e.target.result;
            saveItem();
        };
        reader.readAsDataURL(file);
    } else {
        saveItem();
    }
}

// Current item being claimed
let currentClaimItemId = null;

// Claim item - open claim modal
function claimItem(id) {
    currentClaimItemId = id;
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Pre-fill message if there's a finder contact
    const messageField = document.getElementById('claimerMessage');
    if (item.finderContact) {
        messageField.placeholder = `Der Finder hat angegeben: ${item.finderContact}. Beschreibe kurz, warum du dir sicher bist, dass das dein Gegenstand ist...`;
    }

    document.getElementById('claimItemId').value = id;
    claimModal.classList.add('active');
}

function closeClaimModal() {
    claimModal.classList.remove('active');
    document.getElementById('claimForm').reset();
    currentClaimItemId = null;
}

// Handle claim form submission
function handleClaim(e) {
    e.preventDefault();

    const itemId = parseInt(document.getElementById('claimItemId').value);
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const claimerName = document.getElementById('claimerName').value;
    const claimerEmail = document.getElementById('claimerEmail').value;
    const claimerPhone = document.getElementById('claimerPhone').value;
    const claimerMessage = document.getElementById('claimerMessage').value;

    // Create claim data
    const claimData = {
        itemId: itemId,
        itemTitle: item.title,
        claimerName,
        claimerEmail,
        claimerPhone,
        claimerMessage,
        claimedAt: new Date().toISOString()
    };

    // Store claim in localStorage (in a real app, this would send to a server)
    const claims = JSON.parse(localStorage.getItem('fundbuero_claims') || '[]');
    claims.push(claimData);
    localStorage.setItem('fundbuero_claims', JSON.stringify(claims));

    // Show success message
    closeClaimModal();
    closeDetailModal();

    // Create success message with instructions
    const successHtml = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 16px;">📧</div>
            <div style="font-weight: 700; margin-bottom: 8px;">Anfrage gesendet!</div>
            <div style="font-size: 0.9375rem; opacity: 0.8;">Der Finder wurde benachrichtigt.</div>
        </div>
    `;

    showToastWithHtml(successHtml, 4000);
}

// Simple toast notification
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Toast with HTML content (for claim success)
function showToastWithHtml(html, duration = 4000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = html;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Share item
function shareItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const text = `Gefunden: ${item.title} bei ${item.location} — Fundbüro Uni`;

    if (navigator.share) {
        navigator.share({
            title: 'Fundbüro — Gefundener Gegenstand',
            text: text,
            url: window.location.href
        });
        showToast('Erfolgreich geteilt', 2500);
    } else {
        navigator.clipboard.writeText(text + ' ' + window.location.href);
        showToast('Link in Zwischenablage kopiert', 2500);
    }
}

// Mark item as returned (only for finder in demo mode)
function markAsReturned(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    item.status = 'returned';
    item.returnedAt = new Date().toISOString();

    localStorage.setItem('fundbuero_items', JSON.stringify(items));
    renderItems();
    closeDetailModal();

    showToast('✅ Als zurückgegeben markiert', 3000);
}

// Unmark item as returned (for demo purposes)
function unmarkAsReturned(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    item.status = 'available';
    delete item.returnedAt;

    localStorage.setItem('fundbuero_items', JSON.stringify(items));
    renderItems();
    closeDetailModal();

    showToast('↩️ Wieder als verfügbar markiert', 3000);
}

// Scroll animations
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe steps
    document.querySelectorAll('.step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(el);
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

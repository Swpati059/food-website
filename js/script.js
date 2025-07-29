document.addEventListener('DOMContentLoaded', function() {
    // =================== GLOBAL VARIABLES ===================
    let cartTotal = window.cartTotal || 0;
    let trackingInterval = null;

    // =================== UTILITY FUNCTIONS ===================
    function showNotification(message, type = 'info') {
        // Simple notification - fallback to alert if needed
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    function safeApiCall(url, options = {}) {
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('API Error:', error);
                throw error;
            });
    }

    // =================== LIKES & COMMENTS ===================
    function initializeLikesComments() {
        const boxes = document.querySelectorAll('.box');
        
        boxes.forEach(box => {
            const itemNameElement = box.querySelector('h3');
            if (!itemNameElement) return;
            
            const itemName = itemNameElement.textContent;
            const controls = document.createElement('div');
            controls.className = 'like-comment-controls';
            controls.innerHTML = `
                <button class="like-btn">👍 <span class="like-count">0</span></button>
                <div class="comments-section">
                    <input type="text" class="comment-input" placeholder="Add a comment..." />
                    <button class="comment-submit">Post</button>
                    <div class="comments-list"></div>
                </div>`;
            
            box.appendChild(controls);

            const likeBtn = controls.querySelector('.like-btn');
            const likeCountSpan = controls.querySelector('.like-count');
            const input = controls.querySelector('.comment-input');
            const submit = controls.querySelector('.comment-submit');
            const list = controls.querySelector('.comments-list');

            // Load existing data
            safeApiCall(`/api/items/${encodeURIComponent(itemName)}/stats`)
                .then(data => {
                    likeCountSpan.textContent = data.likes || 0;
                    if (data.comments && Array.isArray(data.comments)) {
                        data.comments.forEach(comment => {
                            const div = document.createElement('div');
                            div.className = 'comment';
                            div.textContent = `${comment.user || 'User'}: ${comment.text}`;
                            list.appendChild(div);
                        });
                    }
                })
                .catch(() => {
                    console.log('Could not load stats for', itemName);
                });

            // Like button click
            likeBtn.addEventListener('click', () => {
                safeApiCall(`/api/items/${encodeURIComponent(itemName)}/like`, { 
                    method: 'POST' 
                })
                .then(data => {
                    likeCountSpan.textContent = data.likes || 0;
                    trackEvent('LikedItem', itemName);
                })
                .catch(() => {
                    showNotification('Error liking item', 'error');
                });
            });

            // Comment submission
            function submitComment() {
                const text = input.value.trim();
                if (!text) return;
                
                safeApiCall(`/api/items/${encodeURIComponent(itemName)}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                })
                .then(comment => {
                    const div = document.createElement('div');
                    div.className = 'comment';
                    div.textContent = `${comment.user || 'You'}: ${comment.text}`;
                    list.appendChild(div);
                    input.value = '';
                    showNotification('Comment posted!', 'success');
                })
                .catch(() => {
                    showNotification('Error posting comment', 'error');
                });
            }

            submit.addEventListener('click', submitComment);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitComment();
                }
            });
        });
    }

    // ============== FEEDBACK FORM ==============
    function initializeFeedbackForm() {
        const feedbackContainer = document.getElementById('feedback-container');
        if (!feedbackContainer) return;
        
        feedbackContainer.innerHTML = `
            <h3>Give Feedback</h3>
            <textarea id="user-feedback" placeholder="Your feedback..."></textarea>
            <button id="send-feedback" class="btn">Submit Feedback</button>`;
        
        const sendFeedbackBtn = document.getElementById('send-feedback');
        if (sendFeedbackBtn) {
            sendFeedbackBtn.addEventListener('click', () => {
                const feedbackInput = document.getElementById('user-feedback');
                const text = feedbackInput ? feedbackInput.value.trim() : '';
                
                if (!text) {
                    showNotification('Feedback cannot be empty.', 'error');
                    return;
                }
                
                safeApiCall('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback: text })
                })
                .then(() => {
                    showNotification('Thank you for your feedback!', 'success');
                    feedbackInput.value = '';
                })
                .catch(() => {
                    showNotification('Error submitting feedback.', 'error');
                });
            });
        }
    }

    // ============== AI RECOMMENDATIONS ==============
    function loadRecommendations() {
        return safeApiCall('/api/recommendations')
            .catch(() => {
                console.log('Could not load recommendations');
                return [];
            });
    }

    function displayRecommendations() {
        loadRecommendations().then(items => {
            const recSection = document.getElementById('recommendations');
            if (!recSection) return;
            
            recSection.innerHTML = '<h3>Recommended for You</h3>';
            
            if (!items || items.length === 0) {
                recSection.innerHTML += '<p>No recommendations available.</p>';
                return;
            }

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'rec-item';
                div.innerHTML = `
                    <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" />
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                    <button class="order-recommend">Order Now</button>`;
                
                recSection.appendChild(div);
                
                const orderBtn = div.querySelector('.order-recommend');
                orderBtn.addEventListener('click', () => {
                    addToCart(item.name, item.price, item.image);
                    trackEvent('OrderClicked', 'Recommendation: ' + item.name);
                });
            });
        });
    }

    // ============== REAL-TIME ORDER TRACKING ==============
    function initLiveLocationTracking(orderId) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        mapContainer.innerHTML = '<div id="order-location">Loading location...</div>';

        function updateLocation() {
            safeApiCall(`/api/orders/${orderId}/location`)
                .then(data => {
                    const locationDiv = document.getElementById('order-location');
                    if (locationDiv && data.lat && data.lng) {
                        locationDiv.textContent = `Current location: (${data.lat}, ${data.lng})`;
                    }
                })
                .catch(() => {
                    console.log('Error updating location');
                });
        }

        // Update immediately and then every 10 seconds
        updateLocation();
        trackingInterval = setInterval(updateLocation, 10000);
    }

    // ============== ANALYTICS / TRACKING EVENTS ==============
    function trackEvent(action, label) {
        // Google Analytics
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: 'MyOnlineMeal',
                event_label: label
            });
        } else if (window.ga) {
            window.ga('send', 'event', 'MyOnlineMeal', action, label);
        }
        
        console.log('Track Event:', action, label);
    }

    function instrumentTracking() {
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-recommend') ||
                (e.target.classList.contains('btn') && e.target.textContent.includes('Order Now'))) {
                trackEvent('OrderClicked', e.target.textContent);
            }
            
            if (e.target.classList.contains('like-btn')) {
                const box = e.target.closest('.box');
                if (box) {
                    const h3 = box.querySelector('h3');
                    if (h3) {
                        trackEvent('LikedItem', h3.textContent);
                    }
                }
            }
        });
    }

    // ============== CART MANAGEMENT ==============
    function addToCart(name, price, image) {
        cartTotal += price;
        window.cartTotal = cartTotal;
        
        // Call existing addToCart if it exists
        if (window.addToCart && typeof window.addToCart === 'function') {
            window.addToCart(name, price, image);
        } else {
            showNotification(`Added ${name} to cart!`, 'success');
        }
        
        // Check for upsell after adding to cart
        setTimeout(showUpsellPrompt, 500);
    }

    // ============== UPSELL / MONETIZATION LOGIC ==============
    function showUpsellPrompt() {
        if (cartTotal > 0 && cartTotal < 500) {
            // Remove existing upsell if any
            const existingUpsell = document.getElementById('upsell');
            if (existingUpsell) {
                existingUpsell.remove();
            }

            const upsell = document.createElement('div');
            upsell.id = 'upsell';
            upsell.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                z-index: 1000;
                max-width: 300px;
            `;
            
            upsell.innerHTML = `
                <p>🍟 Want to add fries & save ₹50 on delivery fee?</p>
                <button id="add-fries" style="background: #4CAF50; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">Add Fries (₹99)</button>
                <button id="dismiss-upsell" style="background: #f44336; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">No thanks</button>
            `;
            
            document.body.appendChild(upsell);

            document.getElementById('add-fries').addEventListener('click', () => {
                addToCart('Fries', 99, '');
                upsell.remove();
                trackEvent('UpsellAccepted', 'Fries');
            });

            document.getElementById('dismiss-upsell').addEventListener('click', () => {
                upsell.remove();
                trackEvent('UpsellDismissed', 'Fries');
            });
        }
    }

    // ============== INITIALIZE EVERYTHING ==============
    
    // Set up global functions
    window.showNotification = showNotification;
    window.addToCart = addToCart;
    window.cartTotal = cartTotal;

    // Initialize existing website if function exists
    if (typeof window.initializeWebsite === 'function') {
        try {
            window.initializeWebsite();
        } catch (error) {
            console.log('Error initializing existing website:', error);
        }
    }

    // Initialize all features
    try {
        initializeLikesComments();
        initializeFeedbackForm();
        displayRecommendations();
        instrumentTracking();
        
        // Initialize location tracking if order ID exists
        const currentOrderId = document.body.getAttribute('data-order-id');
        if (currentOrderId) {
            initLiveLocationTracking(currentOrderId);
        }
        
        // Set up order confirmation listener
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('confirm-order')) {
                setTimeout(showUpsellPrompt, 500);
            }
        });
        
        console.log('MyOnlineMeal initialized successfully');
        
    } catch (error) {
        console.error('Error during initialization:', error);
        showNotification('Some features may not work properly', 'error');
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (trackingInterval) {
            clearInterval(trackingInterval);
        }
    });
});
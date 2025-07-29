// MyOnlineMeal Website JavaScript Functionality
// Author: Generated for food delivery website
// Version: 1.0

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ============= NAVIGATION FUNCTIONALITY =============
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.getElementById('navabar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(255, 127, 80, 0.9)';
            navbar.style.transition = 'background-color 0.3s ease';
        } else {
            navbar.style.backgroundColor = 'transparent';
        }
    });

    // ============= CART FUNCTIONALITY =============
    
    // Shopping cart array to store items
    let cart = [];
    let cartTotal = 0;

    // Create cart modal HTML
    function createCartModal() {
        const cartModal = document.createElement('div');
        cartModal.id = 'cart-modal';
        cartModal.innerHTML = `
            <div class="cart-overlay">
                <div class="cart-content">
                    <div class="cart-header">
                        <h2>Your Cart</h2>
                        <span class="close-cart">&times;</span>
                    </div>
                    <div class="cart-items"></div>
                    <div class="cart-footer">
                        <div class="cart-total">Total: ₹<span id="cart-total-amount">0</span></div>
                        <button class="checkout-btn">Proceed to Checkout</button>
                        <button class="clear-cart-btn">Clear Cart</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(cartModal);

        // Add cart styles
        const cartStyles = `
            <style>
                #cart-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                }
                .cart-overlay {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                }
                .cart-content {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80%;
                    overflow-y: auto;
                }
                .cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .close-cart {
                    font-size: 30px;
                    cursor: pointer;
                    color: #aaa;
                }
                .close-cart:hover {
                    color: #000;
                }
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .cart-item-info {
                    flex: 1;
                }
                .cart-item-name {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .cart-item-price {
                    color: #666;
                }
                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .quantity-controls button {
                    background: #ff6b35;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .remove-item {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                .cart-footer {
                    margin-top: 20px;
                    text-align: center;
                }
                .cart-total {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .checkout-btn, .clear-cart-btn {
                    background: #ff6b35;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                    font-size: 1rem;
                }
                .clear-cart-btn {
                    background: #dc3545;
                }
                .cart-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 12px;
                    min-width: 18px;
                    text-align: center;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', cartStyles);
    }

    // Add cart icon to navigation
    function addCartIcon() {
        const nav = document.querySelector('nav ul');
        const cartItem = document.createElement('li');
        cartItem.className = 'item';
        cartItem.innerHTML = `
            <a href="#" id="cart-icon" style="position: relative;">
                🛒 Cart
                <span class="cart-badge" id="cart-count">0</span>
            </a>
        `;
        nav.appendChild(cartItem);
    }

    // Add to cart functionality
    function addToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: parseInt(price),
                image: image,
                quantity: 1
            });
        }
        
        updateCartUI();
        showNotification(`${name} added to cart!`);
    }

    // Remove from cart
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    // Update quantity
    function updateQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            updateCartUI();
        }
    }

    // Update cart UI
    function updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.querySelector('.cart-items');
        const cartTotalAmount = document.getElementById('cart-total-amount');
        
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update cart total
        cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalAmount) {
            cartTotalAmount.textContent = cartTotal;
        }
        
        // Update cart items display
        if (cartItems) {
            cartItems.innerHTML = '';
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price} each</div>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }

    // Show cart modal
    function showCart() {
        document.getElementById('cart-modal').style.display = 'block';
    }

    // Hide cart modal
    function hideCart() {
        document.getElementById('cart-modal').style.display = 'none';
    }

    // Clear cart
    function clearCart() {
        cart = [];
        updateCartUI();
        showNotification('Cart cleared!');
    }

    // Make functions global
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;

    // ============= NOTIFICATION SYSTEM =============
    
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification styles
        const notificationStyles = `
            <style>
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    z-index: 1001;
                    animation: slideIn 0.3s ease;
                }
                .notification.error {
                    background: #f44336;
                }
                .notification.warning {
                    background: #ff9800;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        if (!document.querySelector('style[data-notification]')) {
            document.head.insertAdjacentHTML('beforeend', notificationStyles.replace('<style>', '<style data-notification>'));
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ============= ORDER BUTTON FUNCTIONALITY =============
    
    // Add click events to all "Order Now" buttons
    function initializeOrderButtons() {
        const orderButtons = document.querySelectorAll('button');
        
        orderButtons.forEach(button => {
            if (button.textContent.includes('Order Now')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get item details from parent box
                    const box = this.closest('.box');
                    const itemName = box.querySelector('h3').textContent;
                    const priceText = box.querySelector('.price') ? box.querySelector('.price').textContent : '0RS';
                    const price = priceText.replace('RS', '').replace('₹', '');
                    const image = box.querySelector('img') ? box.querySelector('img').src : '';
                    
                    addToCart(itemName, price, image);
                });
            }
        });

        // Main "Order Now" button in home section
        const mainOrderButton = document.querySelector('#Home .btn');
        if (mainOrderButton) {
            mainOrderButton.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('#popular').scrollIntoView({
                    behavior: 'smooth'
                });
                showNotification('Choose your favorite food from our menu below!', 'warning');
            });
        }
    }

    // ============= CONTACT FORM FUNCTIONALITY =============
    
    function initializeContactForm() {
        const contactForm = document.querySelector('#contact form');
        
        if (contactForm) {
            // Add submit button if not exists
            if (!contactForm.querySelector('button[type="submit"]')) {
                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Send Message';
                submitButton.className = 'btn';
                submitButton.style.width = '100%';
                submitButton.style.marginTop = '10px';
                contactForm.appendChild(submitButton);
            }

            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const message = document.getElementById('message').value;
                
                // Basic validation
                if (!name || !email || !phone || !message) {
                    showNotification('Please fill in all fields!', 'error');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showNotification('Please enter a valid email address!', 'error');
                    return;
                }
                
                // Phone validation
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
                    showNotification('Please enter a valid 10-digit phone number!', 'error');
                    return;
                }
                
                // Simulate form submission
                showNotification('Message sent successfully! We will contact you soon.');
                contactForm.reset();
            });
        }
    }

    // ============= SEARCH FUNCTIONALITY =============
    
    function addSearchFeature() {
        const navbar = document.querySelector('nav ul');
        const searchItem = document.createElement('li');
        searchItem.className = 'item';
        searchItem.innerHTML = `
            <div style="position: relative;">
                <input type="text" id="search-input" placeholder="Search food..." style="padding: 8px; border-radius: 15px; border: 1px solid #ccc; width: 150px;">
            </div>
        `;
        navbar.appendChild(searchItem);

        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const foodBoxes = document.querySelectorAll('.popular .box, .speciality .box');
            
            foodBoxes.forEach(box => {
                const foodName = box.querySelector('h3').textContent.toLowerCase();
                const foodDescription = box.querySelector('p').textContent.toLowerCase();
                
                if (foodName.includes(searchTerm) || foodDescription.includes(searchTerm)) {
                    box.style.display = 'block';
                } else {
                    box.style.display = searchTerm === '' ? 'block' : 'none';
                }
            });
        });
    }

    // ============= RATING SYSTEM =============
    
    function initializeRatingSystem() {
        const starElements = document.querySelectorAll('.stars');
        
        starElements.forEach(stars => {
            stars.addEventListener('click', function() {
                const box = this.closest('.box');
                const itemName = box.querySelector('h3').textContent;
                showNotification(`Thanks for rating ${itemName}!`);
            });
        });
    }

    // ============= CHECKOUT FUNCTIONALITY =============
    
    function initializeCheckout() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('checkout-btn')) {
                if (cart.length === 0) {
                    showNotification('Your cart is empty!', 'warning');
                    return;
                }
                
                // Create checkout modal
                const checkoutModal = document.createElement('div');
                checkoutModal.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1002; display: flex; justify-content: center; align-items: center;">
                        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                            <h2>Order Confirmation</h2>
                            <p>Total Amount: ₹${cartTotal}</p>
                            <p>Items: ${cart.length}</p>
                            <p>Estimated Delivery: 30-45 minutes</p>
                            <div style="margin-top: 20px;">
                                <button onclick="confirmOrder()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 5px; cursor: pointer;">Confirm Order</button>
                                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 5px; cursor: pointer;">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(checkoutModal);
            }
            
            if (e.target.classList.contains('clear-cart-btn')) {
                clearCart();
            }
        });
    }

    // Confirm order function
    window.confirmOrder = function() {
        showNotification('Order confirmed! You will receive a confirmation call shortly.');
        clearCart();
        hideCart();
        document.querySelector('[style*="position: fixed"]').remove();
    };

    // ============= LOADING ANIMATION =============
    
    function addLoadingAnimation() {
        // Add loading screen
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #fff; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #ff6b35; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 20px; font-size: 1.2rem; color: #666;">Loading MyOnlineMeal...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);

        // Remove loader after page loads
        window.addEventListener('load', function() {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => loader.remove(), 500);
                }
            }, 1000);
        });
    }

    // ============= INITIALIZE ALL FEATURES =============
    
    function initializeWebsite() {
        // Add loading animation
        addLoadingAnimation();
        
        // Create cart modal
        createCartModal();
        
        // Add cart icon to navigation
        addCartIcon();
        
        // Initialize order buttons
        initializeOrderButtons();
        
        // Initialize contact form
        initializeContactForm();
        
        // Add search feature
        addSearchFeature();
        
        // Initialize rating system
        initializeRatingSystem();
        
        // Initialize checkout
        initializeCheckout();
        
        // Cart modal event listeners
        document.getElementById('cart-icon').addEventListener('click', function(e) {
            e.preventDefault();
            showCart();
        });
        
        document.querySelector('.close-cart').addEventListener('click', hideCart);
        
        // Close cart when clicking outside
        document.getElementById('cart-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideCart();
            }
        });
        
        // Welcome message
        setTimeout(() => {
            showNotification('Welcome to MyOnlineMeal! 🍕🍔🍰', 'success');
        }, 2000);
    }

    // Start the website
    initializeWebsite();
    
    // ============= ADDITIONAL FEATURES =============
    
    // Scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff6b35;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Image lazy loading
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 100);
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    console.log('MyOnlineMeal website initialized successfully! 🚀');
});
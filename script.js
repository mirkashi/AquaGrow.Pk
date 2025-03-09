// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navIcons = document.querySelector('.nav-icons');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Create mobile nav if it doesn't exist
            if (!document.querySelector('.mobile-nav')) {
                const mobileNav = document.createElement('div');
                mobileNav.classList.add('mobile-nav');
                
                // Clone navigation links
                const navLinksClone = navLinks.cloneNode(true);
                mobileNav.appendChild(navLinksClone);
                
                // Clone navigation icons
                const navIconsClone = navIcons.cloneNode(true);
                mobileNav.appendChild(navIconsClone);
                
                // Append to body
                document.body.appendChild(mobileNav);
                
                // Add event listeners to mobile nav links
                const mobileNavLinks = mobileNav.querySelectorAll('.nav-links a');
                mobileNavLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        mobileNav.classList.remove('active');
                        hamburger.classList.remove('active');
                    });
                });
                
                // Add animation class after a small delay
                setTimeout(() => {
                    mobileNav.classList.add('active');
                }, 10);
            } else {
                const mobileNav = document.querySelector('.mobile-nav');
                mobileNav.classList.toggle('active');
            }
        });
    }
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.querySelector('.mobile-nav.active');
        if (mobileNav && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
            mobileNav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
    
    // Product Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show/hide products based on filter
            productCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Testimonial Slider
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    
    if (testimonialSlider && testimonialCards.length > 0 && dots.length > 0) {
        let currentSlide = 0;
        let slideWidth;
        
        // Function to calculate slide width
        function calculateSlideWidth() {
            if (window.innerWidth <= 576) {
                return testimonialCards[0].offsetWidth;
            } else {
                return testimonialCards[0].offsetWidth + 30; // Card width + margin
            }
        }
        
        // Initialize slide width
        slideWidth = calculateSlideWidth();
        
        // Function to update slider position
        function updateSlider() {
            // Recalculate slide width on each update
            slideWidth = calculateSlideWidth();
            
            if (window.innerWidth <= 576) {
                // On mobile, stack vertically
                testimonialSlider.style.transform = 'translateY(0)';
            } else {
                // On desktop, slide horizontally
                testimonialSlider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
            }
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Click event for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentSlide = index;
                updateSlider();
            });
        });
        
        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        testimonialSlider.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        testimonialSlider.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            if (window.innerWidth <= 576) return; // Don't handle swipes on mobile vertical layout
            
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left
                if (currentSlide < testimonialCards.length - 1) {
                    currentSlide++;
                    updateSlider();
                }
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSlider();
                }
            }
        }
        
        // Auto slide every 5 seconds
        const autoSlideInterval = setInterval(() => {
            if (window.innerWidth > 576) { // Only auto-slide on desktop
                currentSlide = (currentSlide + 1) % testimonialCards.length;
                updateSlider();
            }
        }, 5000);
        
        // Update slider on window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                updateSlider();
            }, 250);
        });
        
        // Initial update
        updateSlider();
    }
    
    // Cart and Favorites Functionality
    const cartIcon = document.getElementById('cart-icon');
    const favoritesIcon = document.getElementById('favorites-icon');
    const cartModal = document.getElementById('cart-modal');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const favoriteItemsContainer = document.getElementById('favorite-items');
    const cartCount = document.querySelector('.cart-count');
    const favoritesCount = document.querySelector('.favorites-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const emptyFavoritesMessage = document.getElementById('empty-favorites-message');
    const clearCartButton = document.getElementById('clear-cart');
    const checkoutButton = document.getElementById('checkout-btn');
    
    // Initialize cart and favorites from localStorage or create empty arrays
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Update cart and favorites count
    updateCartCount();
    updateFavoritesCount();
    
    // Open cart modal
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
    
    // Open favorites modal
    if (favoritesIcon) {
        favoritesIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openFavoritesModal();
        });
    }
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModals();
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal || e.target === favoritesModal || e.target === checkoutModal || 
            e.target === loginModal || e.target === registerModal || e.target === forgotPasswordModal) {
            if (e.target === checkoutModal) {
                closeCheckoutModal();
                resetCheckoutSteps();
            } else {
                closeModals();
            }
        }
    });
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            addToCart(productId, productName, productPrice, productImage);
            showNotification(`${productName} added to cart`);
        });
    });
    
    // Add to favorites functionality
    const addToFavoritesButtons = document.querySelectorAll('.add-to-favorites');
    addToFavoritesButtons.forEach(button => {
        // Check if product is already in favorites and update button style
        const productId = button.getAttribute('data-id');
        if (isInFavorites(productId)) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            toggleFavorite(productId, productName, productPrice, productImage, this);
        });
    });
    
    // Clear cart button
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            clearCart();
            showNotification('Cart cleared');
        });
    }
    
    // Checkout button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (cart.length > 0) {
                showNotification('Proceeding to checkout...');
                // Here you would typically redirect to a checkout page
                // For demo purposes, we'll just clear the cart
                setTimeout(() => {
                    clearCart();
                    showNotification('Thank you for your purchase!');
                }, 2000);
            }
        });
    }
    
    // Function to add item to cart
    function addToCart(id, name, price, image) {
        // Check if product is already in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            // Increment quantity if already in cart
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart count
        updateCartCount();
        
        // If cart modal is open, update the display
        if (cartModal.style.display === 'block') {
            renderCartItems();
        }
    }
    
    // Function to toggle favorite status
    function toggleFavorite(id, name, price, image, button) {
        // Check if product is already in favorites
        const index = favorites.findIndex(item => item.id === id);
        
        if (index !== -1) {
            // Remove from favorites if already there
            favorites.splice(index, 1);
            button.classList.remove('active');
            showNotification(`${name} removed from favorites`);
        } else {
            // Add to favorites
            favorites.push({
                id: id,
                name: name,
                price: price,
                image: image
            });
            button.classList.add('active');
            showNotification(`${name} added to favorites`);
        }
        
        // Save favorites to localStorage
        saveFavorites();
        
        // Update favorites count
        updateFavoritesCount();
        
        // If favorites modal is open, update the display
        if (favoritesModal.style.display === 'block') {
            renderFavoriteItems();
        }
    }
    
    // Function to check if product is in favorites
    function isInFavorites(id) {
        return favorites.some(item => item.id === id);
    }
    
    // Function to update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Show animation
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 300);
    }
    
    // Function to update favorites count
    function updateFavoritesCount() {
        favoritesCount.textContent = favorites.length;
    }
    
    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Function to save favorites to localStorage
    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // Function to clear cart
    function clearCart() {
        cart = [];
        saveCart();
        updateCartCount();
        renderCartItems();
    }
    
    // Function to open cart modal
    function openCartModal() {
        renderCartItems();
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Function to open favorites modal
    function openFavoritesModal() {
        renderFavoriteItems();
        favoritesModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Function to close all modals
    function closeModals() {
        // Check if elements exist before trying to access them
        if (cartModal) cartModal.style.display = 'none';
        if (favoritesModal) favoritesModal.style.display = 'none';
        if (checkoutModal) checkoutModal.style.display = 'none';
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        
        // Clear form messages
        document.querySelectorAll('.form-message').forEach(message => {
            message.classList.remove('error', 'success');
            message.style.display = 'none';
            message.textContent = '';
        });
    }
    
    // Function to render cart items
    function renderCartItems() {
        if (cart.length === 0) {
            // Show empty cart message
            cartItemsContainer.style.display = 'none';
            document.querySelector('.cart-summary').style.display = 'none';
            emptyCartMessage.style.display = 'block';
        } else {
            // Hide empty cart message
            cartItemsContainer.style.display = 'block';
            document.querySelector('.cart-summary').style.display = 'block';
            emptyCartMessage.style.display = 'none';
            
            // Clear current items
            cartItemsContainer.innerHTML = '';
            
            // Calculate total price
            let total = 0;
            
            // Add each item to the cart
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;
                
                cartItemsContainer.appendChild(cartItemElement);
            });
            
            // Update total price
            cartTotalPrice.textContent = `$${total.toFixed(2)}`;
            
            // Add event listeners to quantity buttons and remove buttons
            addCartItemEventListeners();
        }
    }
    
    // Function to render favorite items
    function renderFavoriteItems() {
        if (favorites.length === 0) {
            // Show empty favorites message
            favoriteItemsContainer.style.display = 'none';
            emptyFavoritesMessage.style.display = 'block';
        } else {
            // Hide empty favorites message
            favoriteItemsContainer.style.display = 'block';
            emptyFavoritesMessage.style.display = 'none';
            
            // Clear current items
            favoriteItemsContainer.innerHTML = '';
            
            // Add each item to favorites
            favorites.forEach(item => {
                const favoriteItemElement = document.createElement('div');
                favoriteItemElement.className = 'favorite-item';
                favoriteItemElement.innerHTML = `
                    <div class="favorite-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="favorite-item-details">
                        <div class="favorite-item-name">${item.name}</div>
                        <div class="favorite-item-price">$${item.price.toFixed(2)}</div>
                        <div class="favorite-item-actions">
                            <button class="btn btn-primary add-to-cart-from-favorites" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">Add to Cart</button>
                        </div>
                    </div>
                    <button class="favorite-item-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;
                
                favoriteItemsContainer.appendChild(favoriteItemElement);
            });
            
            // Add event listeners to add to cart and remove buttons
            addFavoriteItemEventListeners();
        }
    }
    
    // Function to add event listeners to cart item buttons
    function addCartItemEventListeners() {
        // Decrease quantity buttons
        const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateCartItemQuantity(id, -1);
            });
        });
        
        // Increase quantity buttons
        const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateCartItemQuantity(id, 1);
            });
        });
        
        // Quantity input fields
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const id = this.getAttribute('data-id');
                const newQuantity = parseInt(this.value);
                if (newQuantity > 0) {
                    setCartItemQuantity(id, newQuantity);
                } else {
                    this.value = 1;
                    setCartItemQuantity(id, 1);
                }
            });
        });
        
        // Remove buttons
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeCartItem(id);
            });
        });
    }
    
    // Function to add event listeners to favorite item buttons
    function addFavoriteItemEventListeners() {
        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-from-favorites');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = parseFloat(this.getAttribute('data-price'));
                const image = this.getAttribute('data-image');
                
                addToCart(id, name, price, image);
                showNotification(`${name} added to cart`);
            });
        });
        
        // Remove buttons
        const removeButtons = document.querySelectorAll('.favorite-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFavoriteItem(id);
            });
        });
    }
    
    // Function to update cart item quantity
    function updateCartItemQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                item.quantity = 1;
            }
            saveCart();
            updateCartCount();
            renderCartItems();
        }
    }
    
    // Function to set cart item quantity
    function setCartItemQuantity(id, quantity) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            saveCart();
            updateCartCount();
            renderCartItems();
        }
    }
    
    // Function to remove cart item
    function removeCartItem(id) {
        const index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
            const removedItem = cart[index];
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            renderCartItems();
            showNotification(`${removedItem.name} removed from cart`);
        }
    }
    
    // Function to remove favorite item
    function removeFavoriteItem(id) {
        const index = favorites.findIndex(item => item.id === id);
        if (index !== -1) {
            const removedItem = favorites[index];
            favorites.splice(index, 1);
            
            // Update the heart button if it exists on the page
            const heartButton = document.querySelector(`.add-to-favorites[data-id="${id}"]`);
            if (heartButton) {
                heartButton.classList.remove('active');
            }
            
            saveFavorites();
            updateFavoritesCount();
            renderFavoriteItems();
            showNotification(`${removedItem.name} removed from favorites`);
        }
    }
    
    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // In a real application, you would send this to a server
                showNotification('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }
    
    // Smooth Scrolling for Anchor Links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only if the href is not just "#"
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Scroll to element
                    window.scrollTo({
                        top: targetElement.offsetTop - 100, // Offset for header
                        behavior: 'smooth'
                    });
                    
                    // Close mobile nav if open
                    const mobileNav = document.querySelector('.mobile-nav.active');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        hamburger.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // Lazy loading images
    if ('IntersectionObserver' in window) {
        const imgOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px 50px 0px"
        };
        
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, imgOptions);
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imgObserver.observe(img);
        });
    }
    
    // Image Slider Functionality
    const imageSlider = document.querySelector('.image-slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sliderDots = document.querySelectorAll('.slider-dots .dot');
    
    if (imageSlider && slides.length > 0) {
        let currentSlide = 0;
        const slideCount = slides.length;
        
        // Function to update the slider position
        function updateSlider() {
            imageSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update active dot
            sliderDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Next slide function
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlider();
        }
        
        // Previous slide function
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            updateSlider();
        }
        
        // Event listeners for buttons
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        // Event listeners for dots
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
        });
        
        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        imageSlider.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        imageSlider.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left (next)
                nextSlide();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right (prev)
                prevSlide();
            }
        }
        
        // Auto slide every 5 seconds
        const autoSlideInterval = setInterval(nextSlide, 5000);
        
        // Pause auto slide on hover
        imageSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        // Resume auto slide on mouse leave
        imageSlider.addEventListener('mouseleave', () => {
            clearInterval(autoSlideInterval);
            setInterval(nextSlide, 5000);
        });
        
        // Initialize slider
        updateSlider();
    }
    
    // Authentication System
    const userIcon = document.getElementById('user-icon');
    const userDropdown = document.getElementById('user-dropdown');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.getElementById('back-to-login');
    const logoutLink = document.getElementById('logout-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const passwordToggleBtns = document.querySelectorAll('.toggle-password');
    const registerPassword = document.getElementById('register-password');
    const strengthMeter = document.getElementById('strength-meter-fill');
    const strengthText = document.getElementById('strength-text');
    
    // User data storage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // Check if user is logged in
    checkAuthStatus();
    
    // User icon click event
    if (userIcon) {
        userIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (currentUser) {
                // Toggle user dropdown if logged in
                userDropdown.classList.toggle('active');
            } else {
                // Show login modal if not logged in
                openLoginModal();
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (userDropdown && userDropdown.classList.contains('active') && !userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Register link click
    if (registerLink) {
        registerLink.addEventListener('click', function() {
            closeModals();
            openRegisterModal();
        });
    }
    
    // Login link click
    if (loginLink) {
        loginLink.addEventListener('click', function() {
            closeModals();
            openLoginModal();
        });
    }
    
    // Forgot password link click
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModals();
            openForgotPasswordModal();
        });
    }
    
    // Back to login link click
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function() {
            closeModals();
            openLoginModal();
        });
    }
    
    // Logout link click
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Toggle password visibility
    passwordToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
    
    // Password strength meter
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            updatePasswordStrengthUI(strength);
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            login(email, password, rememberMe);
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const termsAccepted = document.getElementById('terms-checkbox').checked;
            
            register(name, email, password, confirmPassword, termsAccepted);
        });
    }
    
    // Forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('forgot-email').value;
            
            resetPassword(email);
        });
    }
    
    // Function to check authentication status
    function checkAuthStatus() {
        if (currentUser) {
            // Update UI for logged in user
            updateUserUI(currentUser);
        }
    }
    
    // Function to update UI for logged in user
    function updateUserUI(user) {
        // Update user dropdown info
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        
        // Change user icon to show logged in state
        userIcon.classList.add('logged-in');
    }
    
    // Function to login
    function login(email, password, rememberMe) {
        const loginMessage = document.getElementById('login-message');
        
        // Validate inputs
        if (!email || !password) {
            showFormMessage(loginMessage, 'Please enter both email and password.', 'error');
            return;
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showFormMessage(loginMessage, 'Email not found. Please check your email or register.', 'error');
            return;
        }
        
        // Check password
        if (user.password !== password) {
            showFormMessage(loginMessage, 'Incorrect password. Please try again.', 'error');
            return;
        }
        
        // Login successful
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Update UI
        updateUserUI(currentUser);
        
        // Close modal and show success message
        closeModals();
        showNotification('Login successful! Welcome back, ' + user.name);
        
        // Send login data to owner's email
        sendDataToOwner('User Login', {
            name: user.name,
            email: user.email,
            timestamp: new Date().toISOString()
        });
    }
    
    // Function to register
    function register(name, email, password, confirmPassword, termsAccepted) {
        const registerMessage = document.getElementById('register-message');
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            showFormMessage(registerMessage, 'Please fill in all fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showFormMessage(registerMessage, 'Please enter a valid email address.', 'error');
            return;
        }
        
        // Check if email already exists
        if (users.some(user => user.email === email)) {
            showFormMessage(registerMessage, 'Email already registered. Please use a different email or login.', 'error');
            return;
        }
        
        // Check password strength
        const strength = checkPasswordStrength(password);
        if (strength.score < 2) {
            showFormMessage(registerMessage, 'Password is too weak. Please choose a stronger password.', 'error');
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showFormMessage(registerMessage, 'Passwords do not match. Please try again.', 'error');
            return;
        }
        
        // Check terms acceptance
        if (!termsAccepted) {
            showFormMessage(registerMessage, 'Please accept the Terms of Service and Privacy Policy.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateUserUI(currentUser);
        
        // Close modal and show success message
        closeModals();
        showNotification('Registration successful! Welcome to AquaGrow, ' + name);
        
        // Send registration data to owner's email
        sendDataToOwner('New User Registration', {
            name: name,
            email: email,
            timestamp: new Date().toISOString()
        });
    }
    
    // Function to reset password
    function resetPassword(email) {
        const forgotPasswordMessage = document.getElementById('forgot-password-message');
        
        // Validate email
        if (!email) {
            showFormMessage(forgotPasswordMessage, 'Please enter your email address.', 'error');
            return;
        }
        
        // Check if email exists
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showFormMessage(forgotPasswordMessage, 'Email not found. Please check your email or register.', 'error');
            return;
        }
        
        // Generate reset token (in a real app, this would be a secure token)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Update user with reset token
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show success message
        showFormMessage(forgotPasswordMessage, 'Password reset link has been sent to your email. Please check your inbox.', 'success');
        
        // Clear form
        document.getElementById('forgot-email').value = '';
        
        // Send password reset data to owner's email
        sendDataToOwner('Password Reset Request', {
            email: email,
            resetToken: resetToken,
            timestamp: new Date().toISOString()
        });
    }
    
    // Function to logout
    function logout() {
        // Clear user data
        currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        // Update UI
        userIcon.classList.remove('logged-in');
        userDropdown.classList.remove('active');
        
        // Show notification
        showNotification('You have been logged out successfully.');
    }
    
    // Function to open login modal
    function openLoginModal() {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Function to open register modal
    function openRegisterModal() {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Function to open forgot password modal
    function openForgotPasswordModal() {
        forgotPasswordModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Function to show form message
    function showFormMessage(element, message, type) {
        element.textContent = message;
        element.className = 'form-message ' + type;
        element.style.display = 'block';
    }
    
    // Function to check password strength
    function checkPasswordStrength(password) {
        let score = 0;
        let feedback = '';
        
        // Length check
        if (password.length < 6) {
            feedback = 'Too short';
        } else if (password.length >= 10) {
            score += 2;
        } else {
            score += 1;
        }
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score += 1; // Uppercase
        if (/[a-z]/.test(password)) score += 1; // Lowercase
        if (/[0-9]/.test(password)) score += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special characters
        
        // Determine feedback based on score
        if (score < 2) {
            feedback = 'Weak';
        } else if (score < 4) {
            feedback = 'Moderate';
        } else if (score < 6) {
            feedback = 'Strong';
        } else {
            feedback = 'Very strong';
        }
        
        return {
            score: score,
            feedback: feedback
        };
    }
    
    // Function to update password strength UI
    function updatePasswordStrengthUI(strength) {
        // Update strength meter fill width
        let percentage = (strength.score / 6) * 100;
        strengthMeter.style.width = percentage + '%';
        
        // Update color based on strength
        if (strength.score < 2) {
            strengthMeter.style.backgroundColor = '#e74c3c'; // Red
        } else if (strength.score < 4) {
            strengthMeter.style.backgroundColor = '#f39c12'; // Orange
        } else if (strength.score < 6) {
            strengthMeter.style.backgroundColor = '#2ecc71'; // Green
        } else {
            strengthMeter.style.backgroundColor = '#27ae60'; // Dark Green
        }
        
        // Update text
        strengthText.textContent = strength.feedback;
    }
    
    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Function to generate user ID
    function generateUserId() {
        return 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
    }
    
    // Function to send data to owner's email
    function sendDataToOwner(subject, data) {
        // Log the data being sent
        console.log('Sending to owner:', subject, data);
        
        // Use EmailJS to send the data to the owner's email
        emailjs.send(
            'service_id', // Replace with your EmailJS service ID
            'template_id', // Replace with your EmailJS template ID
            {
                subject: subject,
                to_email: 'owner@example.com', // Replace with the owner's email
                from_name: 'AquaGrow Website',
                message: JSON.stringify(data, null, 2)
            }
        ).then(
            function(response) {
                console.log('Email sent successfully:', response);
            },
            function(error) {
                console.error('Email failed to send:', error);
            }
        );
    }
    
    // Add CSS for elements created by JavaScript
    addDynamicStyles();
    
    // Checkout System
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const backToCartBtn = document.getElementById('back-to-cart');
    const toPaymentBtn = document.getElementById('to-payment');
    const backToShippingBtn = document.getElementById('back-to-shipping');
    const toReviewBtn = document.getElementById('to-review');
    const backToPaymentBtn = document.getElementById('back-to-payment');
    const placeOrderBtn = document.getElementById('place-order');
    const viewOrdersBtn = document.getElementById('view-orders');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const checkoutCloseBtn = document.querySelector('#checkout-modal .close-modal');
    
    const shippingSection = document.getElementById('shipping-section');
    const paymentSection = document.getElementById('payment-section');
    const reviewSection = document.getElementById('review-section');
    const confirmationSection = document.getElementById('confirmation-section');
    
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    const shippingForm = document.getElementById('shipping-form');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    const cardPaymentForm = document.getElementById('card-payment-form');
    
    // Order data
    let orderData = {
        items: [],
        shipping: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            selectedCity: '',
            method: 'standard',
            cost: 5.99
        },
        payment: {
            method: 'card',
            cardNumber: '',
            cardName: '',
            expiryDate: '',
            cvv: '',
            saveCard: false
        },
        totals: {
            subtotal: 0,
            shipping: 5.99,
            tax: 0,
            total: 0
        },
        orderId: '',
        orderDate: ''
    };
    
    // Initialize checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Prepare order data from cart
            prepareOrderData();
            
            // Open checkout modal
            openCheckoutModal();
        });
    }
    
    // Close checkout modal button
    if (checkoutCloseBtn) {
        checkoutCloseBtn.addEventListener('click', function() {
            console.log('Checkout close button clicked (from DOMContentLoaded)');
            closeCheckoutModal();
            resetCheckoutSteps();
        });
    } else {
        console.error('Checkout close button not found in DOMContentLoaded');
    }
    
    // Back to cart button
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function() {
            closeCheckoutModal();
            openCartModal();
        });
    }
    
    // Continue to payment button
    if (toPaymentBtn && shippingForm) {
        shippingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate shipping form
            if (validateShippingForm()) {
                // Save shipping data
                saveShippingData();
                
                // Go to payment step
                goToPaymentStep();
            }
        });
    }
    
    // Back to shipping button
    if (backToShippingBtn) {
        backToShippingBtn.addEventListener('click', function() {
            goToShippingStep();
        });
    }
    
    // Continue to review button
    if (toReviewBtn) {
        toReviewBtn.addEventListener('click', function() {
            // Validate payment form
            if (validatePaymentForm()) {
                // Save payment data
                savePaymentData();
                
                // Go to review step
                goToReviewStep();
            }
        });
    }
    
    // Back to payment button
    if (backToPaymentBtn) {
        backToPaymentBtn.addEventListener('click', function() {
            goToPaymentStep();
        });
    }
    
    // Place order button
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            // Process order
            processOrder();
        });
    }
    
    // View orders button
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function() {
            closeCheckoutModal();
            // In a real app, redirect to orders page
            showNotification('Redirecting to your orders...');
        });
    }
    
    // Continue shopping button
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            closeCheckoutModal();
            showNotification('Thank you for your purchase!');
        });
    }
    
    // Payment option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Get payment method
            const paymentMethod = this.getAttribute('data-payment');
            
            // Update radio button
            document.getElementById(this.querySelector('input').id).checked = true;
            
            // Show corresponding form
            showPaymentForm(paymentMethod);
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Add spaces after every 4 digits
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            
            // Update input value
            this.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Add slash after 2 digits
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            
            // Update input value
            this.value = value;
        });
    }
    
    // CVV input - numbers only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
        });
    }
    
    // Shipping method selection
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Update shipping method and cost
            updateShippingMethod(this.value);
        });
    });
    
    // Function to prepare order data from cart
    function prepareOrderData() {
        // Clear previous items
        orderData.items = [];
        
        // Add items from cart
        cart.forEach(item => {
            orderData.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                total: item.price * item.quantity
            });
        });
        
        // Calculate totals
        calculateOrderTotals();
    }
    
    // Function to calculate order totals
    function calculateOrderTotals() {
        // Calculate subtotal
        orderData.totals.subtotal = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Set shipping cost based on method
        if (orderData.shipping.method === 'standard') {
            orderData.totals.shipping = 5.99;
        } else if (orderData.shipping.method === 'express') {
            orderData.totals.shipping = 12.99;
        } else if (orderData.shipping.method === 'overnight') {
            orderData.totals.shipping = 24.99;
        }
        
        // Calculate tax (assuming 8% tax rate)
        orderData.totals.tax = orderData.totals.subtotal * 0.08;
        
        // Calculate total
        orderData.totals.total = orderData.totals.subtotal + orderData.totals.shipping + orderData.totals.tax;
    }
    
    // Function to open checkout modal
    function openCheckoutModal() {
        // Reset checkout steps
        resetCheckoutSteps();
        
        checkoutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Ensure close button has event listener
        const closeBtn = document.querySelector('#checkout-modal .close-modal');
        if (closeBtn) {
            // Remove any existing listeners to avoid duplicates
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // Add fresh event listener
            newCloseBtn.addEventListener('click', function() {
                console.log('Close button clicked from openCheckoutModal');
                closeCheckoutModal();
                resetCheckoutSteps();
            });
        }
        
        // Pre-fill form if user is logged in
        if (currentUser) {
            prefillShippingForm();
        }
    }
    
    // Function to close checkout modal
    function closeCheckoutModal() {
        console.log('Closing checkout modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            console.error('Checkout modal not found when trying to close');
        }
    }
    
    // Function to reset checkout steps
    function resetCheckoutSteps() {
        // Show shipping section, hide others
        shippingSection.style.display = 'block';
        paymentSection.style.display = 'none';
        reviewSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        
        // Update step indicators
        checkoutSteps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Function to validate shipping form
    function validateShippingForm() {
        // Get form values
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const selectedCity = document.getElementById('selected-city').value;
        
        // Check if all fields are filled
        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip || !selectedCity) {
            showNotification('Please fill in all required fields.');
            return false;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.');
            return false;
        }
        
        // Save preferred city for future use
        localStorage.setItem('preferredCity', selectedCity);
        
        return true;
    }
    
    // Function to save shipping data
    function saveShippingData() {
        // Get form inputs
        orderData.shipping.firstName = document.getElementById('first-name').value;
        orderData.shipping.lastName = document.getElementById('last-name').value;
        orderData.shipping.email = document.getElementById('email').value;
        orderData.shipping.phone = document.getElementById('phone').value;
        orderData.shipping.address = document.getElementById('address').value;
        orderData.shipping.city = document.getElementById('city').value;
        orderData.shipping.state = document.getElementById('state').value;
        orderData.shipping.zip = document.getElementById('zip').value;
        orderData.shipping.selectedCity = document.getElementById('selected-city').value;
        
        // Get shipping method
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        updateShippingMethod(shippingMethod);
    }
    
    // Function to update shipping method
    function updateShippingMethod(method) {
        orderData.shipping.method = method;
        
        // Update shipping cost based on method
        if (method === 'standard') {
            orderData.shipping.cost = 5.99;
        } else if (method === 'express') {
            orderData.shipping.cost = 12.99;
        } else if (method === 'overnight') {
            orderData.shipping.cost = 24.99;
        }
        
        // Recalculate totals
        calculateOrderTotals();
    }
    
    // Function to go to payment step
    function goToPaymentStep() {
        // Hide shipping section, show payment section
        shippingSection.style.display = 'none';
        paymentSection.style.display = 'block';
        reviewSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        
        // Update step indicators
        checkoutSteps.forEach((step, index) => {
            if (index === 0) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (index === 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Function to go to shipping step
    function goToShippingStep() {
        // Show shipping section, hide others
        shippingSection.style.display = 'block';
        paymentSection.style.display = 'none';
        reviewSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        
        // Update step indicators
        checkoutSteps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Function to validate payment form
    function validatePaymentForm() {
        // Get selected payment method
        const paymentMethod = document.querySelector('.payment-option.active').getAttribute('data-payment');
        
        // If credit card, validate card details
        if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('card-number').value;
            const cardName = document.getElementById('card-name').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;
            
            // Check if all fields are filled
            if (!cardNumber || !cardName || !expiryDate || !cvv) {
                showNotification('Please fill in all card details.');
                return false;
            }
            
            // Validate card number (basic validation)
            if (cardNumber.replace(/\s/g, '').length < 16) {
                showNotification('Please enter a valid card number.');
                return false;
            }
            
            // Validate expiry date (MM/YY format)
            if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
                showNotification('Please enter a valid expiry date (MM/YY).');
                return false;
            }
            
            // Validate CVV (3-4 digits)
            if (!cvv.match(/^\d{3,4}$/)) {
                showNotification('Please enter a valid CVV code.');
                return false;
            }
        }
        
        return true;
    }
    
    // Function to save payment data
    function savePaymentData() {
        // Get selected payment method
        const paymentMethod = document.querySelector('.payment-option.active').getAttribute('data-payment');
        orderData.payment.method = paymentMethod;
        
        // If credit card, save card details
        if (paymentMethod === 'card') {
            orderData.payment.cardNumber = document.getElementById('card-number').value;
            orderData.payment.cardName = document.getElementById('card-name').value;
            orderData.payment.expiryDate = document.getElementById('expiry-date').value;
            orderData.payment.cvv = document.getElementById('cvv').value;
            orderData.payment.saveCard = document.getElementById('save-card').checked;
        }
    }
    
    // Function to show payment form based on method
    function showPaymentForm(method) {
        // Hide all payment forms
        paymentForms.forEach(form => {
            form.style.display = 'none';
        });
        
        // Show selected payment form
        if (method === 'card') {
            document.getElementById('card-payment-form').style.display = 'block';
        } else if (method === 'paypal') {
            document.getElementById('paypal-form').style.display = 'block';
        } else if (method === 'apple') {
            document.getElementById('apple-pay-form').style.display = 'block';
        } else if (method === 'google') {
            document.getElementById('google-pay-form').style.display = 'block';
        }
        
        // Update payment method
        orderData.payment.method = method;
    }
    
    // Function to go to review step
    function goToReviewStep() {
        // Hide payment section, show review section
        shippingSection.style.display = 'none';
        paymentSection.style.display = 'none';
        reviewSection.style.display = 'block';
        confirmationSection.style.display = 'none';
        
        // Update step indicators
        checkoutSteps.forEach((step, index) => {
            if (index === 0 || index === 1) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (index === 2) {
                step.classList.add('active');
                step.classList.remove('completed');
            }
        });
        
        // Render review items
        renderReviewItems();
        
        // Render shipping address
        renderShippingAddress();
        
        // Render payment method
        renderPaymentMethod();
        
        // Render order totals
        renderOrderTotals();
    }
    
    // Function to render review items
    function renderReviewItems() {
        const reviewItemsContainer = document.getElementById('review-items');
        reviewItemsContainer.innerHTML = '';
        
        // Add each item to the review
        orderData.items.forEach(item => {
            const reviewItemElement = document.createElement('div');
            reviewItemElement.className = 'review-item';
            reviewItemElement.innerHTML = `
                <div class="review-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="review-item-details">
                    <div class="review-item-name">${item.name}</div>
                    <div class="review-item-price">$${item.price.toFixed(2)}</div>
                    <div class="review-item-quantity">Quantity: ${item.quantity}</div>
                </div>
            `;
            
            reviewItemsContainer.appendChild(reviewItemElement);
        });
    }
    
    // Function to render shipping address
    function renderShippingAddress() {
        const addressElement = document.getElementById('review-address');
        const shipping = orderData.shipping;
        
        // Get the full city name based on the selected city code
        let cityName = shipping.selectedCity;
        const citySelect = document.getElementById('selected-city');
        if (citySelect) {
            const selectedOption = citySelect.querySelector(`option[value="${shipping.selectedCity}"]`);
            if (selectedOption) {
                cityName = selectedOption.textContent;
            }
        }
        
        addressElement.innerHTML = `
            ${shipping.firstName} ${shipping.lastName}<br>
            ${shipping.address}<br>
            ${shipping.city}, ${shipping.state} ${shipping.zip}<br>
            ${cityName}<br>
            ${shipping.phone}<br>
            ${shipping.email}<br>
            <strong>Shipping Method:</strong> ${getShippingMethodName(shipping.method)}
        `;
    }
    
    // Function to render payment method
    function renderPaymentMethod() {
        const paymentElement = document.getElementById('review-payment');
        const payment = orderData.payment;
        
        if (payment.method === 'card') {
            // Mask card number
            const maskedCardNumber = payment.cardNumber.replace(/\d(?=\d{4})/g, '*');
            
            paymentElement.innerHTML = `
                Credit/Debit Card<br>
                ${maskedCardNumber}<br>
                ${payment.cardName}
            `;
        } else if (payment.method === 'paypal') {
            paymentElement.innerHTML = 'PayPal';
        } else if (payment.method === 'apple') {
            paymentElement.innerHTML = 'Apple Pay';
        } else if (payment.method === 'google') {
            paymentElement.innerHTML = 'Google Pay';
        }
    }
    
    // Function to render order totals
    function renderOrderTotals() {
        document.getElementById('review-subtotal').textContent = `$${orderData.totals.subtotal.toFixed(2)}`;
        document.getElementById('review-shipping').textContent = `$${orderData.totals.shipping.toFixed(2)}`;
        document.getElementById('review-tax').textContent = `$${orderData.totals.tax.toFixed(2)}`;
        document.getElementById('review-total').textContent = `$${orderData.totals.total.toFixed(2)}`;
    }
    
    // Function to process order
    function processOrder() {
        // Generate order ID
        orderData.orderId = generateOrderId();
        orderData.orderDate = new Date().toISOString();
        
        // In a real app, send order to server
        // For demo, we'll just simulate a successful order
        
        // Show loading notification
        showNotification('Processing your order...');
        
        // Simulate processing delay
        setTimeout(() => {
            // Clear cart
            clearCart();
            
            // Show confirmation
            showConfirmation();
            
            // Send order confirmation email
            sendOrderConfirmation();
        }, 2000);
    }
    
    // Function to show confirmation
    function showConfirmation() {
        // Hide review section, show confirmation section
        shippingSection.style.display = 'none';
        paymentSection.style.display = 'none';
        reviewSection.style.display = 'none';
        confirmationSection.style.display = 'block';
        
        // Update step indicators
        checkoutSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        
        // Set order number and email
        document.getElementById('order-number').textContent = orderData.orderId;
        document.getElementById('confirmation-email').textContent = orderData.shipping.email;
    }
    
    // Function to send order confirmation
    function sendOrderConfirmation() {
        // Get the full city name based on the selected city code
        let cityName = orderData.shipping.selectedCity;
        const citySelect = document.getElementById('selected-city');
        if (citySelect) {
            const selectedOption = citySelect.querySelector(`option[value="${orderData.shipping.selectedCity}"]`);
            if (selectedOption) {
                cityName = selectedOption.textContent;
            }
        }
        
        // Send email using EmailJS
        emailjs.send(
            'service_id', // Replace with your EmailJS service ID
            'template_id', // Replace with your EmailJS template ID
            {
                to_name: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
                to_email: orderData.shipping.email,
                order_id: orderData.orderId,
                order_date: orderData.orderDate,
                customerName: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
                customerEmail: orderData.shipping.email,
                shippingAddress: `${orderData.shipping.address}, ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zip}, ${cityName}`,
                items: orderData.items.map(item => `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n'),
                subtotal: `$${orderData.totals.subtotal.toFixed(2)}`,
                shipping: `$${orderData.totals.shipping.toFixed(2)}`,
                tax: `$${orderData.totals.tax.toFixed(2)}`,
                total: `$${orderData.totals.total.toFixed(2)}`
            }
        ).then(
            function(response) {
                console.log('Order confirmation email sent successfully:', response);
            },
            function(error) {
                console.error('Order confirmation email failed to send:', error);
            }
        );
    }
    
    // Function to prefill shipping form
    function prefillShippingForm() {
        // If user is logged in and we have their info
        if (currentUser) {
            // In a real app, you would fetch user's saved address
            // For demo, we'll just fill in the email
            document.getElementById('email').value = currentUser.email;
            
            // If we have user's name, fill that too
            if (currentUser.name) {
                const nameParts = currentUser.name.split(' ');
                if (nameParts.length > 0) {
                    document.getElementById('first-name').value = nameParts[0];
                }
                if (nameParts.length > 1) {
                    document.getElementById('last-name').value = nameParts.slice(1).join(' ');
                }
            }
            
            // If we have saved city preference, select it
            if (localStorage.getItem('preferredCity')) {
                const citySelect = document.getElementById('selected-city');
                if (citySelect) {
                    citySelect.value = localStorage.getItem('preferredCity');
                }
            }
        }
    }
    
    // Function to get shipping method name
    function getShippingMethodName(method) {
        if (method === 'standard') {
            return 'Standard Shipping (5-7 Business Days)';
        } else if (method === 'express') {
            return 'Express Shipping (2-3 Business Days)';
        } else if (method === 'overnight') {
            return 'Overnight Shipping (Next Business Day)';
        }
        return '';
    }
    
    // Function to generate order ID
    function generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `AG-${timestamp}-${random}`;
    }
});

// Function to add dynamic styles
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Mobile Navigation */
        .mobile-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background-color: white;
            z-index: 999;
            padding: 80px 20px 20px;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
        }
        
        .mobile-nav.active {
            transform: translateY(0);
        }
        
        .mobile-nav .nav-links {
            display: flex;
            flex-direction: column;
            margin-bottom: 30px;
        }
        
        .mobile-nav .nav-links li {
            margin: 10px 0;
        }
        
        .mobile-nav .nav-icons {
            display: flex;
            justify-content: center;
        }
        
        .hamburger.active .line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active .line:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .line:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
        
        /* Notification */
        .notification {
            position: fixed;
            bottom: -100px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--dark-color);
            color: white;
            padding: 15px 25px;
            border-radius: 30px;
            box-shadow: var(--box-shadow);
            z-index: 1000;
            transition: bottom 0.3s ease;
            max-width: 90%;
            text-align: center;
        }
        
        .notification.active {
            bottom: 30px;
        }
        
        /* Cart Count Animation */
        .cart-count.pulse {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
        }
        
        /* Responsive Fixes */
        @media (max-width: 576px) {
            .notification {
                padding: 10px 20px;
                font-size: 14px;
            }
            
            .notification.active {
                bottom: 20px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Add event delegation for modal close buttons
document.addEventListener('click', function(event) {
    // Check if the clicked element is a close button in any modal
    if (event.target.classList.contains('close-modal')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            if (modal.id === 'checkout-modal') {
                console.log('Checkout close button clicked via delegation');
                closeCheckoutModal();
                resetCheckoutSteps();
            } else if (modal.id === 'login-modal' || modal.id === 'register-modal' || modal.id === 'forgot-password-modal') {
                console.log('Authentication modal close button clicked via delegation');
                closeModals();
            } else {
                closeModals();
            }
        }
    }
});

// Add specific event listeners for authentication modal close buttons
if (registerModal) {
    const registerCloseBtn = registerModal.querySelector('.close-modal');
    if (registerCloseBtn) {
        registerCloseBtn.addEventListener('click', function() {
            console.log('Register modal close button clicked');
            closeModals();
        });
    }
}

if (loginModal) {
    const loginCloseBtn = loginModal.querySelector('.close-modal');
    if (loginCloseBtn) {
        loginCloseBtn.addEventListener('click', function() {
            console.log('Login modal close button clicked');
            closeModals();
        });
    }
}

if (forgotPasswordModal) {
    const forgotCloseBtn = forgotPasswordModal.querySelector('.close-modal');
    if (forgotCloseBtn) {
        forgotCloseBtn.addEventListener('click', function() {
            console.log('Forgot password modal close button clicked');
            closeModals();
        });
    }
} 
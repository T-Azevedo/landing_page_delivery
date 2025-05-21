// Registro do Service Worker para PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registrado com sucesso: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('Falha no registro do ServiceWorker: ', err);
                    });
            });
        }

        $(document).ready(function() {
            // Initialize cart
            let cart = [];
            let cartTotal = 0;
            const storeCep = "26277-120"; // CEP da loja
            
            // Update cart count in navbar and floating button
            function updateCartCount() {
                const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
                $('.cart-count, .floating-cart-count').text(totalItems);
                
                // Disable next button if cart is empty
                $('#next-step').prop('disabled', totalItems === 0);
                
                // Animation effect when items are added
                if (totalItems > 0) {
                    $('.floating-cart-count').addClass('animate__animated animate__bounceIn');
                    setTimeout(() => {
                        $('.floating-cart-count').removeClass('animate__animated animate__bounceIn');
                    }, 1000);
                }
            }
            
            // Update cart modal
            function updateCartModal() {
                const cartItems = $('#cart-items');
                const cartTotalElement = $('#cart-total');
                
                if (cart.length === 0) {
                    cartItems.html('<p class="text-center">Seu carrinho está vazio</p>');
                    cartTotalElement.text('R$ 0,00');
                    $('#next-step').prop('disabled', true);
                    return;
                }
                
                let itemsHtml = '';
                let newTotal = 0;
                
                cart.forEach((item, index) => {
                    const itemTotal = item.price * item.quantity;
                    newTotal += itemTotal;
                    
                    itemsHtml += `
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6>${item.name} (${item.quantity}x)</h6>
                                <small class="text-muted">R$ ${item.price.toFixed(2)} cada</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="me-3">R$ ${itemTotal.toFixed(2)}</span>
                                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                cartItems.html(itemsHtml);
                cartTotalElement.text(`R$ ${newTotal.toFixed(2)}`);
                cartTotal = newTotal;
                
                // Add event listeners to remove buttons
                $('.remove-item').click(function() {
                    const index = $(this).data('index');
                    cart.splice(index, 1);
                    updateCartModal();
                    updateCartCount();
                });
            }

            // Update order summary
            function updateOrderSummary() {
                const summaryItems = $('#summary-items');
                const summaryAddress = $('#summary-address');
                const summaryPayment = $('#summary-payment');
                const summaryTotal = $('#summary-total');
                
                // Items summary
                let itemsHtml = '<h6>Itens:</h6>';
                cart.forEach(item => {
                    itemsHtml += `
                        <div class="d-flex justify-content-between">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `;
                });
                summaryItems.html(itemsHtml);
                
                // Address summary
                const name = $('#name-input').val();
                const street = $('#street-input').val();
                const number = $('#number-input').val();
                const neighborhood = $('#neighborhood-input').val();
                const cep = $('#cep-input').val();
                
                let addressHtml = `
                    <p>${name}</p>
                    <p>${street}, ${number}</p>
                    <p>${neighborhood}</p>
                `;
                
                if (cep) {
                    addressHtml += `<p>CEP: ${cep}</p>`;
                }
                
                summaryAddress.html(addressHtml);
                
                // Payment summary
                const paymentMethod = $('input[name="payment-method"]:checked').val();
                let paymentHtml = `<p>${paymentMethod}</p>`;
                
                if (paymentMethod === 'Dinheiro') {
                    const changeValue = $('#change-value').val();
                    if (changeValue) {
                        paymentHtml += `<p>Troco para: R$ ${parseFloat(changeValue).toFixed(2)}</p>`;
                    }
                }
                
                summaryPayment.html(paymentHtml);
                summaryTotal.text(`R$ ${cartTotal.toFixed(2)}`);
            }
            
            // Quantity controls
            $('.quantity-btn').click(function() {
                const input = $(this).siblings('.quantity-input');
                let value = parseInt(input.val());
                
                if ($(this).hasClass('minus') && value > 1) {
                    input.val(value - 1);
                } else if ($(this).hasClass('plus')) {
                    input.val(value + 1);
                }
            });
            
            // Add to cart functionality with animation
            $('.add-to-cart').click(function() {
                const itemName = $(this).data('item');
                const itemPrice = parseFloat($(this).data('price'));
                const quantity = parseInt($(this).siblings('.quantity-control').find('.quantity-input').val());
                
                // Trigger animation
                $(this).addClass('animated');
                setTimeout(() => {
                    $(this).removeClass('animated');
                }, 500);
                
                // Check if item already exists in cart
                const existingItemIndex = cart.findIndex(item => item.name === itemName);
                
                if (existingItemIndex >= 0) {
                    // Update quantity if item exists
                    cart[existingItemIndex].quantity += quantity;
                } else {
                    // Add new item to cart
                    cart.push({
                        name: itemName,
                        price: itemPrice,
                        quantity: quantity
                    });
                }
                
                // Update UI
                updateCartCount();
                updateCartModal();
                
                // Show feedback
                const toast = $(`
                    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
                        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header bg-primary text-white">
                                <strong class="me-auto">Item adicionado</strong>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">
                                ${quantity}x ${itemName} adicionado ao carrinho
                            </div>
                        </div>
                    </div>
                `);
                
                $('body').append(toast);
                
                // Remove toast after 3 seconds
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            });
            
            // Navbar scroll effect
            $(window).scroll(function() {
                if ($(this).scrollTop() > 50) {
                    $('.navbar').addClass('scrolled');
                } else {
                    $('.navbar').removeClass('scrolled');
                }
            });
            
            // Format CEP input
            $('#cep-input').on('input', function() {
                let cep = $(this).val().replace(/\D/g, '');
                if (cep.length > 5) {
                    cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
                }
                $(this).val(cep);
            });

            // Validate address fields
            function validateAddressFields() {
                let isValid = true;
                
                // Validate Name (minimum 1 character)
                const name = $('#name-input').val().trim();
                if (name.length < 1) {
                    $('#name-input').addClass('is-invalid');
                    $('#name-input').siblings('.invalid-feedback').show();
                    isValid = false;
                } else {
                    $('#name-input').removeClass('is-invalid');
                    $('#name-input').siblings('.invalid-feedback').hide();
                }
                
                // Validate Street (minimum 1 character)
                const street = $('#street-input').val().trim();
                if (street.length < 1) {
                    $('#street-input').addClass('is-invalid');
                    $('#street-input').siblings('.invalid-feedback').show();
                    isValid = false;
                } else {
                    $('#street-input').removeClass('is-invalid');
                    $('#street-input').siblings('.invalid-feedback').hide();
                }
                
                // Validate Number (minimum 1 character)
                const number = $('#number-input').val().trim();
                if (number.length < 1) {
                    $('#number-input').addClass('is-invalid');
                    $('#number-input').siblings('.invalid-feedback').show();
                    isValid = false;
                } else {
                    $('#number-input').removeClass('is-invalid');
                    $('#number-input').siblings('.invalid-feedback').hide();
                }
                
                // Validate Neighborhood (minimum 1 character)
                const neighborhood = $('#neighborhood-input').val().trim();
                if (neighborhood.length < 1) {
                    $('#neighborhood-input').addClass('is-invalid');
                    $('#neighborhood-input').siblings('.invalid-feedback').show();
                    isValid = false;
                } else {
                    $('#neighborhood-input').removeClass('is-invalid');
                    $('#neighborhood-input').siblings('.invalid-feedback').hide();
                }
                
                return isValid;
            }

            // Enable/disable next button based on validation
            $('#name-input, #street-input, #number-input, #neighborhood-input').on('input', function() {
                if ($('#address-verification').is(':visible')) {
                    // Remove error when typing
                    $(this).removeClass('is-invalid');
                    $(this).siblings('.invalid-feedback').hide();
                }
            });
            
            // Show/hide change input based on payment method
            $('input[name="payment-method"]').change(function() {
                if ($(this).val() === 'Dinheiro') {
                    $('#change-input').addClass('show');
                } else {
                    $('#change-input').removeClass('show');
                }
            });
            
            // Next step button click
            $('#next-step').click(function() {
                // Se estiver na tela de itens do carrinho
                if ($('#cart-items-section').is(':visible')) {
                    if (cart.length === 0) {
                        alert('Seu carrinho está vazio. Adicione itens para continuar.');
                        return;
                    }
                    
                    // Mostra a tela de endereço
                    $('#cart-items-section').hide();
                    $('#address-verification').show();
                    $('#back-to-cart').show();
                    $('#next-step').text('Avançar');
                } 
                // Se estiver na tela de endereço
                else if ($('#address-verification').is(':visible')) {
                    if (!validateAddressFields()) {
                        // Mostra os campos inválidos
                        $('input.is-invalid').first().focus();
                        return;
                    }
                    
                    // Mostra a tela de pagamento
                    $('#address-verification').hide();
                    $('#payment-section').show();
                    $('#back-to-cart').hide();
                    $('#back-to-address').show();
                    $('#next-step').text('Avançar');
                }
                // Se estiver na tela de pagamento
                else if ($('#payment-section').is(':visible')) {
                    // Mostra o resumo do pedido
                    updateOrderSummary();
                    $('#payment-section').hide();
                    $('#order-summary').show();
                    $('#back-to-address').hide();
                    $('#back-to-payment').show();
                    $('#next-step').hide();
                    $('#finish-order').show();
                }
            });
            
            // Back to cart button click
            $('#back-to-cart').click(function() {
                $('#address-verification').hide();
                $('#cart-items-section').show();
                $(this).hide();
                $('#next-step').text('Avançar').show();
            });

            // Back to address button click
            $('#back-to-address').click(function() {
                $('#payment-section').hide();
                $('#address-verification').show();
                $(this).hide();
                $('#back-to-cart').show();
                $('#next-step').show();
            });

            // Back to payment button click
            $('#back-to-payment').click(function() {
                $('#order-summary').hide();
                $('#payment-section').show();
                $(this).hide();
                $('#back-to-address').show();
                $('#next-step').show();
                $('#finish-order').hide();
            });
            
            // Verify CEP button click
            $('#verify-cep').click(function() {
                const cep = $('#cep-input').val().replace(/\D/g, '');
                
                if (cep.length !== 8) {
                    alert('Por favor, digite um CEP válido com 8 dígitos');
                    return;
                }
                
                $('#cep-loading').show();
                $('#delivery-area').hide();
                
                // ViaCEP API call
                $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data) {
                    $('#cep-loading').hide();
                    
                    if (data.erro) {
                        $('#delivery-area').html('<p>CEP não encontrado, por favor preencha manualmente</p>')
                            .removeClass('valid invalid').show();
                        return;
                    }
                    
                    // Fill address fields
                    if (data.logradouro) $('#street-input').val(data.logradouro);
                    if (data.bairro) $('#neighborhood-input').val(data.bairro);
                    
                    // Simple distance check
                    const customerCepPrefix = cep.substring(0, 3);
                    const storeCepPrefix = storeCep.replace(/\D/g, '').substring(0, 3);
                    
                    if (customerCepPrefix === storeCepPrefix) {
                        $('#delivery-area').html('<p><i class="fas fa-check-circle me-2"></i>Seu endereço está dentro da nossa área de entrega!</p>')
                            .removeClass('invalid').addClass('valid').show();
                    } else {
                        $('#delivery-area').html('<p><i class="fas fa-exclamation-circle me-2"></i>Verifique se atendemos no seu endereço</p>')
                            .removeClass('valid').addClass('invalid').show();
                    }
                    
                    // Trigger validation
                    validateAddressFields();
                }).fail(function() {
                    $('#cep-loading').hide();
                    $('#delivery-area').html('<p>Erro ao consultar CEP. Por favor, tente novamente.</p>')
                        .removeClass('valid invalid').show();
                });
            });

            // Finish order button click
            $('#finish-order').click(function() {
                const name = $('#name-input').val();
                const street = $('#street-input').val();
                const number = $('#number-input').val();
                const neighborhood = $('#neighborhood-input').val();
                const cep = $('#cep-input').val();
                const notes = $('#order-notes').val();
                const paymentMethod = $('input[name="payment-method"]:checked').val();
                const changeValue = $('#change-value').val();
                
                // Format items for WhatsApp message
                let itemsText = '';
                cart.forEach(item => {
                    itemsText += `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)} cada)\n`;
                });
                
                // Format address for WhatsApp message
                let addressText = `${street}, ${number}\n${neighborhood}`;
                if (cep) addressText += `\nCEP: ${cep}`;
                
                // Format payment for WhatsApp message
                let paymentText = `Forma de pagamento: ${paymentMethod}`;
                if (paymentMethod === 'Dinheiro' && changeValue) {
                    paymentText += `\nTroco para: R$ ${parseFloat(changeValue).toFixed(2)}`;
                }
                
                // Create WhatsApp message
                const whatsappMessage = `*NOVO PEDIDO - SABOR CASEIRO*\n\n` +
                    `*Cliente:* ${name}\n\n` +
                    `*Itens:*\n${itemsText}\n` +
                    `*Endereço de entrega:*\n${addressText}\n\n` +
                    `*${paymentText}*\n\n` +
                    `*Total:* R$ ${cartTotal.toFixed(2)}\n\n` +
                    `*Observações:* ${notes || 'Nenhuma'}`;
                
                // Encode for URL
                const encodedMessage = encodeURIComponent(whatsappMessage);
                
                // Open WhatsApp
                window.open(`https://wa.me/5521988984058?text=${encodedMessage}`, '_blank');
                
                // Close modal and reset cart
                $('#cartModal').modal('hide');
                cart = [];
                cartTotal = 0;
                updateCartCount();
                updateCartModal();
            });

            // Reset modal when closed
            $('#cartModal').on('hidden.bs.modal', function () {
                $('#cart-items-section').show();
                $('#address-verification').hide();
                $('#payment-section').hide();
                $('#order-summary').hide();
                $('#back-to-cart').hide();
                $('#back-to-address').hide();
                $('#back-to-payment').hide();
                $('#next-step').text('Avançar').show().prop('disabled', cart.length === 0);
                $('#finish-order').hide();
                
                // Reset validation
                $('input').removeClass('is-invalid');
                $('.invalid-feedback').hide();
            });
        });
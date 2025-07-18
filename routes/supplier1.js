const express = require('express');
const router = express.Router();

// Supplier1 products endpoint
router.get('/', async (req, res) => {
    try {
        console.log('Supplier1 request received');

        // Mock supplier1 data - in a real scenario, this would come from a supplier database
        const supplier1Products = [
            {
                asin: 'SUP001',
                title: 'Premium Office Chair - Ergonomic Design with Lumbar Support',
                image: 'https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Office+Chair',
                price: {
                    amount: 299.99,
                    currency: 'USD',
                    formatted: 'USD 299.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP002',
                title: 'Wireless Bluetooth Headphones - Noise Cancelling Technology',
                image: 'https://via.placeholder.com/300x300/2196F3/FFFFFF?text=Headphones',
                price: {
                    amount: 149.99,
                    currency: 'USD',
                    formatted: 'USD 149.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP003',
                title: 'Smart LED Desk Lamp with USB Charging Port',
                image: 'https://via.placeholder.com/300x300/FF9800/FFFFFF?text=Desk+Lamp',
                price: {
                    amount: 79.99,
                    currency: 'USD',
                    formatted: 'USD 79.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP004',
                title: 'Mechanical Gaming Keyboard - RGB Backlit Keys',
                image: 'https://via.placeholder.com/300x300/9C27B0/FFFFFF?text=Keyboard',
                price: {
                    amount: 129.99,
                    currency: 'USD',
                    formatted: 'USD 129.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP005',
                title: 'Portable External Hard Drive - 2TB Storage Capacity',
                image: 'https://via.placeholder.com/300x300/607D8B/FFFFFF?text=Hard+Drive',
                price: {
                    amount: 89.99,
                    currency: 'USD',
                    formatted: 'USD 89.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP006',
                title: 'Wireless Mouse - Precision Optical Sensor',
                image: 'https://via.placeholder.com/300x300/795548/FFFFFF?text=Mouse',
                price: {
                    amount: 39.99,
                    currency: 'USD',
                    formatted: 'USD 39.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP007',
                title: 'Standing Desk Converter - Adjustable Height Workstation',
                image: 'https://via.placeholder.com/300x300/FF5722/FFFFFF?text=Standing+Desk',
                price: {
                    amount: 199.99,
                    currency: 'USD',
                    formatted: 'USD 199.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            },
            {
                asin: 'SUP008',
                title: 'USB-C Hub - Multi-Port Adapter with HDMI Output',
                image: 'https://via.placeholder.com/300x300/3F51B5/FFFFFF?text=USB+Hub',
                price: {
                    amount: 59.99,
                    currency: 'USD',
                    formatted: 'USD 59.99'
                },
                url: '#',
                hasAddToCart: true,
                supplierId: 'supplier1'
            }
        ];

        const supplier1Refinements = [
            {
                selectionType: 'InsteadSelect',
                displayValue: 'Category',
                refinementValues: [
                    {
                        searchRefinementValue: 'electronics',
                        displayName: 'Electronics',
                        count: 15
                    },
                    {
                        searchRefinementValue: 'office',
                        displayName: 'Office Supplies',
                        count: 12
                    },
                    {
                        searchRefinementValue: 'furniture',
                        displayName: 'Furniture',
                        count: 8
                    }
                ]
            },
            {
                selectionType: 'MultiSelectOR',
                displayValue: 'Price Range',
                refinementValues: [
                    {
                        searchRefinementValue: 'under50',
                        displayName: 'Under $50',
                        count: 5
                    },
                    {
                        searchRefinementValue: '50to100',
                        displayName: '$50 - $100',
                        count: 8
                    },
                    {
                        searchRefinementValue: '100to200',
                        displayName: '$100 - $200',
                        count: 10
                    },
                    {
                        searchRefinementValue: 'over200',
                        displayName: 'Over $200',
                        count: 7
                    }
                ]
            },
            {
                selectionType: 'SingleSelect',
                displayValue: 'Brand',
                refinementValues: [
                    {
                        searchRefinementValue: 'supplier1_premium',
                        displayName: 'Supplier1 Premium'
                    },
                    {
                        searchRefinementValue: 'supplier1_standard',
                        displayName: 'Supplier1 Standard'
                    },
                    {
                        searchRefinementValue: 'supplier1_budget',
                        displayName: 'Supplier1 Budget'
                    }
                ]
            }
        ];

        const response = {
            totalResults: 30,
            numberOfPages: 4,
            currentPage: 0,
            pageSize: 8,
            searchRefinements: supplier1Refinements,
            products: supplier1Products
        };

        console.log('Supplier1 response prepared:', response);
        res.json(response);

    } catch (error) {
        console.error('Error in supplier1 endpoint:', error);
        res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                status: 500
            }
        });
    }
});

// Get product details by ASIN for Supplier1
router.get('/:asin', async (req, res) => {
    try {
        console.log(`Supplier1 product details request for ASIN: ${req.params.asin}`);

        const { asin } = req.params;

        // Mock product details data based on ASIN
        const mockProductDetails = {
            'SUP001': {
                asin: 'SUP001',
                features: [
                    'Ergonomic design with lumbar support',
                    'Adjustable height and tilt mechanism',
                    'High-quality mesh back for breathability',
                    'Padded armrests for comfort',
                    '360-degree swivel base',
                    'Weight capacity: 250 lbs'
                ],
                title: 'Premium Office Chair - Ergonomic Design with Lumbar Support',
                description: 'Experience ultimate comfort and support with our premium ergonomic office chair. Designed for long hours of work, this chair features adjustable lumbar support, breathable mesh backing, and premium padding. The chair includes height adjustment, tilt mechanism, and smooth-rolling casters for easy mobility. Perfect for home offices, corporate environments, and co-working spaces.',
                price: {
                    amount: 299.99,
                    currency: 'USD',
                    formatted: 'USD 299.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP001-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP002': {
                asin: 'SUP002',
                features: [
                    'Active noise cancellation technology',
                    'Bluetooth 5.0 connectivity',
                    '30-hour battery life',
                    'Quick charge: 15 minutes for 3 hours playback',
                    'Premium sound quality with deep bass',
                    'Comfortable over-ear design'
                ],
                title: 'Wireless Bluetooth Headphones - Noise Cancelling Technology',
                description: 'Immerse yourself in crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation technology, these headphones block out ambient noise for an uninterrupted listening experience. With 30-hour battery life and quick charge capability, you can enjoy your music all day long. The comfortable over-ear design makes them perfect for travel, work, or leisure.',
                price: {
                    amount: 149.99,
                    currency: 'USD',
                    formatted: 'USD 149.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP002-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP003': {
                asin: 'SUP003',
                features: [
                    'LED lighting with adjustable brightness',
                    'Built-in USB charging port',
                    'Touch-sensitive controls',
                    'Flexible gooseneck design',
                    'Energy-efficient LED bulbs',
                    'Modern minimalist design'
                ],
                title: 'Smart LED Desk Lamp with USB Charging Port',
                description: 'Illuminate your workspace with our smart LED desk lamp. Featuring adjustable brightness levels and a built-in USB charging port for your devices. The touch-sensitive controls make it easy to adjust lighting, while the flexible gooseneck design allows you to direct light exactly where you need it. Energy-efficient LED technology provides long-lasting, eye-friendly illumination.',
                price: {
                    amount: 79.99,
                    currency: 'USD',
                    formatted: 'USD 79.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP003-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP004': {
                asin: 'SUP004',
                features: [
                    'Mechanical switches for tactile feedback',
                    'RGB backlighting with customizable colors',
                    'Anti-ghosting technology',
                    'Durable aluminum frame',
                    'Programmable macro keys',
                    'Compatible with Windows and Mac'
                ],
                title: 'Mechanical Gaming Keyboard - RGB Backlit Keys',
                description: 'Elevate your gaming experience with our premium mechanical keyboard. Featuring responsive mechanical switches, customizable RGB backlighting, and anti-ghosting technology for precise keystrokes. The durable aluminum frame ensures longevity, while programmable macro keys give you a competitive edge. Perfect for gaming, programming, and professional typing.',
                price: {
                    amount: 129.99,
                    currency: 'USD',
                    formatted: 'USD 129.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP004-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP005': {
                asin: 'SUP005',
                features: [
                    '2TB storage capacity',
                    'USB 3.0 for fast data transfer',
                    'Compact and portable design',
                    'Plug-and-play compatibility',
                    'Shock-resistant construction',
                    'Compatible with PC, Mac, and gaming consoles'
                ],
                title: 'Portable External Hard Drive - 2TB Storage Capacity',
                description: 'Expand your storage with our reliable 2TB portable external hard drive. Featuring USB 3.0 connectivity for fast data transfer speeds and plug-and-play compatibility with multiple devices. The compact, shock-resistant design makes it perfect for backing up files, storing media, and expanding storage for gaming consoles. Compatible with Windows, Mac, and gaming systems.',
                price: {
                    amount: 89.99,
                    currency: 'USD',
                    formatted: 'USD 89.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP005-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP006': {
                asin: 'SUP006',
                features: [
                    'Precision optical sensor',
                    'Wireless 2.4GHz connectivity',
                    'Ergonomic design for comfort',
                    'Long battery life (12 months)',
                    'Plug-and-play USB receiver',
                    'Compatible with Windows and Mac'
                ],
                title: 'Wireless Mouse - Precision Optical Sensor',
                description: 'Experience smooth and precise cursor control with our wireless optical mouse. Featuring a high-precision sensor and ergonomic design for comfortable use during long work sessions. The wireless 2.4GHz connection provides reliable performance with minimal lag. With up to 12 months of battery life and plug-and-play setup, this mouse is perfect for office work and everyday computing.',
                price: {
                    amount: 39.99,
                    currency: 'USD',
                    formatted: 'USD 39.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP006-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP007': {
                asin: 'SUP007',
                features: [
                    'Adjustable height mechanism',
                    'Spacious work surface',
                    'Easy assembly and setup',
                    'Sturdy steel frame construction',
                    'Cable management system',
                    'Supports dual monitor setup'
                ],
                title: 'Standing Desk Converter - Adjustable Height Workstation',
                description: 'Transform your workspace with our adjustable standing desk converter. Easily switch between sitting and standing positions to improve posture and reduce fatigue. The spacious work surface accommodates laptops, monitors, and accessories, while the sturdy steel frame ensures stability. Features include cable management and easy height adjustment mechanism for a clean, organized workspace.',
                price: {
                    amount: 199.99,
                    currency: 'USD',
                    formatted: 'USD 199.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP007-OFFER-001',
                supplierId: 'supplier1'
            },
            'SUP008': {
                asin: 'SUP008',
                features: [
                    'Multiple connectivity ports',
                    'HDMI output for external displays',
                    'USB-C and USB-A ports',
                    'Compact and portable design',
                    'Plug-and-play compatibility',
                    'High-speed data transfer'
                ],
                title: 'USB-C Hub - Multi-Port Adapter with HDMI Output',
                description: 'Expand your device connectivity with our versatile USB-C hub. Featuring multiple ports including HDMI, USB-C, and USB-A for connecting various peripherals and external displays. The compact design makes it perfect for travel, while plug-and-play compatibility ensures easy setup with laptops, tablets, and smartphones. Ideal for presentations, data transfer, and expanding device functionality.',
                price: {
                    amount: 59.99,
                    currency: 'USD',
                    formatted: 'USD 59.99'
                },
                image: 'assets/no-image.svg',
                url: '#',
                hasAddToCart: true,
                offerId: 'SUP008-OFFER-001',
                supplierId: 'supplier1'
            }
        };

        // Find the product details for the requested ASIN
        const productDetails = mockProductDetails[asin];

        if (!productDetails) {
            return res.status(404).json({
                error: {
                    message: `Product with ASIN ${asin} not found in Supplier1 catalog`,
                    status: 404
                }
            });
        }

        console.log('Returning Supplier1 product details:', JSON.stringify(productDetails, null, 2));
        res.json(productDetails);

    } catch (error) {
        console.error('Error getting Supplier1 product details:', error);
        res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                status: 500
            }
        });
    }
});

// Place order for Supplier1 product
router.post('/place-order', async (req, res) => {
    try {
        console.log('Supplier1 place order request received');
        console.log('Request body:', req.body);

        const { asin, offerId } = req.body;

        // Validate required parameters
        if (!asin || !offerId) {
            return res.status(400).json({
                error: {
                    message: 'Missing required parameters: asin and offerId are required',
                    status: 400
                }
            });
        }

        // Mock validation - check if ASIN exists in our catalog
        const validAsins = ['SUP001', 'SUP002', 'SUP003', 'SUP004', 'SUP005', 'SUP006', 'SUP007', 'SUP008'];
        
        if (!validAsins.includes(asin)) {
            return res.status(404).json({
                error: {
                    message: `Product with ASIN ${asin} not found in Supplier1 catalog`,
                    status: 404
                }
            });
        }

        // Mock validation - check if offerId matches the expected format
        const expectedOfferId = `${asin}-OFFER-001`;
        if (offerId !== expectedOfferId) {
            return res.status(400).json({
                error: {
                    message: `Invalid offerId ${offerId} for ASIN ${asin}. Expected ${expectedOfferId}`,
                    status: 400
                }
            });
        }

        // Simulate order placement logic
        // In a real scenario, this would integrate with inventory management, payment processing, etc.
        
        // Mock response - simulate successful order placement
        const orderResponse = {
            isOrderPlaced: true,
            quantity: 1, // Default quantity for mock order
            orderId: `SUP-ORDER-${Date.now()}`, // Generate mock order ID
            asin: asin,
            offerId: offerId,
            timestamp: new Date().toISOString()
        };

        console.log('Supplier1 order placed successfully:', orderResponse);
        res.json(orderResponse);

    } catch (error) {
        console.error('Error placing Supplier1 order:', error);
        res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                status: 500
            }
        });
    }
});

module.exports = router;

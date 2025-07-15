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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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
                hasAddToCart: true
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

module.exports = router;

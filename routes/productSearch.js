const express = require('express');
const router = express.Router();
const ProductSearchService = require('../services/ProductSearchService');

// Middleware to validate required credentials
const validateCredentials = (req, res, next) => {
    // Prioritize environment variables over headers
    const accessToken = process.env.X_AMZ_ACCESS_TOKEN || req.headers['x-amz-access-token'];
    const userEmail = process.env.X_AMZ_USER_EMAIL || req.headers['x-amz-user-email'];

    console.log('Validating credentials...');
    console.log('Access Token present:', !!accessToken);
    console.log('User Email present:', !!userEmail);
    console.log('Using env variables:', !!process.env.X_AMZ_ACCESS_TOKEN && !!process.env.X_AMZ_USER_EMAIL);

    if (!accessToken || !userEmail) {
        console.error('Missing required credentials: access token or user email not found in environment variables or headers');
        return res.status(400).json({
            error: {
                message: 'Missing required credentials: X_AMZ_ACCESS_TOKEN and X_AMZ_USER_EMAIL must be set in environment variables or provided as headers',
                status: 400
            }
        });
    }

    req.amazonHeaders = {
        accessToken,
        userEmail
    };

    next();
};


// Search products endpoint
router.get('/search', validateCredentials, async (req, res) => {
    try {
        console.log('Product search request received');
        console.log('Query parameters:', req.query);

        const {
            keywords,
            productRegion = 'US',
            locale = 'en_US',
            pageNumber = 0,
            pageSize = 24,
            searchRefinements
        } = req.query;

        // Allow empty keywords for general product search
        const searchKeywords = keywords || '';

        console.log(`Searching for products with keywords: "${searchKeywords}"`);

        // Prepare search parameters
        const searchParams = {
            keywords: searchKeywords,
            productRegion,
            locale,
            pageNumber: parseInt(pageNumber),
            pageSize: parseInt(pageSize),
            facets: ['IMAGES', 'OFFERS']
        };

        // Add searchRefinements if provided
        if (searchRefinements && searchRefinements.trim()) {
            searchParams.searchRefinements = searchRefinements;
            console.log(`✅ Including searchRefinements in API call: ${searchRefinements}`);
            console.log(`📊 SearchRefinements parameter length: ${searchRefinements.length} characters`);
        } else {
            console.log(`ℹ️  No searchRefinements provided in request`);
        }

        console.log(`🔍 Final search parameters being sent to ProductSearchService:`, JSON.stringify(searchParams, null, 2));

        // Call the ProductSearchService
        const searchResults = await ProductSearchService.searchProducts(searchParams, req.amazonHeaders);

        console.log(`Search completed. Found ${searchResults.matchingProductCount} products`);
        console.log('Raw searchRefinements from API:', JSON.stringify(searchResults.searchRefinements, null, 2));

        // Filter searchRefinements to exclude those with empty refinementValues
        const filteredSearchRefinements = (searchResults.searchRefinements || []).filter(refinement => 
            refinement.refinementValues && refinement.refinementValues.length > 0
        );

        console.log('Filtered searchRefinements:', JSON.stringify(filteredSearchRefinements, null, 2));

        // Transform the response to include required fields
        const transformedResults = {
            totalResults: searchResults.matchingProductCount,
            numberOfPages: searchResults.numberOfPages,
            currentPage: parseInt(pageNumber),
            pageSize: parseInt(pageSize),
            searchRefinements: filteredSearchRefinements,
            products: searchResults.products.map(product => {
                // Extract price from first offer
                let price = null;
                if (product.includedDataTypes && product.includedDataTypes.OFFERS && product.includedDataTypes.OFFERS.length > 0) {
                    const firstOffer = product.includedDataTypes.OFFERS[0];
                    if (firstOffer.price && firstOffer.price.value) {
                        price = {
                            amount: firstOffer.price.value.amount,
                            currency: firstOffer.price.value.currencyCode,
                            formatted: `${firstOffer.price.value.currencyCode} ${firstOffer.price.value.amount}`
                        };
                    }
                }

                // Extract image URL
                let imageUrl = null;
                if (product.includedDataTypes && product.includedDataTypes.IMAGES && product.includedDataTypes.IMAGES.length > 0) {
                    const firstImage = product.includedDataTypes.IMAGES[0];
                    if (firstImage.large && firstImage.large.url) {
                        imageUrl = firstImage.large.url;
                    } else if (firstImage.medium && firstImage.medium.url) {
                        imageUrl = firstImage.medium.url;
                    } else if (firstImage.small && firstImage.small.url) {
                        imageUrl = firstImage.small.url;
                    }
                }

                return {
                    asin: product.asin,
                    title: product.title,
                    image: imageUrl,
                    price: price,
                    url: product.url,
                    hasAddToCart: true
                };
            })
        };

        console.log('Sending transformed results to client');
        res.json(transformedResults);

    } catch (error) {
        console.error('Error in product search:', error);
        
        // Handle specific API errors
        if (error.response) {
            const status = error.response.status || 500;
            const message = error.response.data?.errors?.[0]?.message || error.message || 'API Error';
            
            console.error(`API Error - Status: ${status}, Message: ${message}`);
            console.error('Request ID:', error.response.headers?.['x-amzn-requestid']);
            
            return res.status(status).json({
                error: {
                    message: message,
                    status: status,
                    requestId: error.response.headers?.['x-amzn-requestid']
                }
            });
        }

        // Handle network or other errors
        res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                status: 500
            }
        });
    }
});

// Supplier1 mock data endpoint
router.get('/supplier1', (req, res) => {
    try {
        console.log('Supplier1 mock data request received');
        console.log('Query parameters:', req.query);

        const {
            pageNumber = 0,
            pageSize = 24
        } = req.query;

        const mockProducts = [
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

        const mockRefinements = [
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

        // Calculate pagination
        const totalProducts = mockProducts.length;
        const currentPage = parseInt(pageNumber);
        const pageSizeInt = parseInt(pageSize);
        const startIndex = currentPage * pageSizeInt;
        const endIndex = startIndex + pageSizeInt;
        const paginatedProducts = mockProducts.slice(startIndex, endIndex);
        const numberOfPages = Math.ceil(totalProducts / pageSizeInt);

        const response = {
            totalResults: totalProducts,
            numberOfPages: numberOfPages,
            currentPage: currentPage,
            pageSize: pageSizeInt,
            searchRefinements: mockRefinements,
            products: paginatedProducts
        };

        console.log(`Returning ${paginatedProducts.length} products for supplier1 (page ${currentPage + 1} of ${numberOfPages})`);
        res.json(response);

    } catch (error) {
        console.error('Error in supplier1 endpoint:', error);
        res.status(500).json({
            error: {
                message: 'Internal Server Error',
                status: 500
            }
        });
    }
});

// Get product details by ASIN
router.get('/:asin', validateCredentials, async (req, res) => {
    try {
        console.log(`Product details request for ASIN: ${req.params.asin}`);

        const { asin } = req.params;
        const {
            productRegion = 'US',
            locale = 'en_US'
        } = req.query;

        const productDetails = await ProductSearchService.getProductDetails({
            asin,
            productRegion,
            locale,
            facets: ['IMAGES', 'OFFERS']
        }, req.amazonHeaders);

        console.log(`Product details retrieved for ASIN: ${asin}`);
        res.json(productDetails);

    } catch (error) {
        console.error('Error getting product details:', error);
        
        if (error.response) {
            const status = error.response.status || 500;
            const message = error.response.data?.errors?.[0]?.message || error.message || 'API Error';
            
            console.error(`API Error - Status: ${status}, Message: ${message}`);
            console.error('Request ID:', error.response.headers?.['x-amzn-requestid']);
            
            return res.status(status).json({
                error: {
                    message: message,
                    status: status,
                    requestId: error.response.headers?.['x-amzn-requestid']
                }
            });
        }

        res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                status: 500
            }
        });
    }
});

module.exports = router;

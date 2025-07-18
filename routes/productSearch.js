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
                    hasAddToCart: true,
                    supplierId: 'AmazonBusiness'
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

        // Extract price and offerId from first offer
        let price = null;
        let offerId = null;
        if (productDetails.includedDataTypes && productDetails.includedDataTypes.OFFERS && productDetails.includedDataTypes.OFFERS.length > 0) {
            const firstOffer = productDetails.includedDataTypes.OFFERS[0];
            offerId = firstOffer.offerId || null;
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
        if (productDetails.includedDataTypes && productDetails.includedDataTypes.IMAGES && productDetails.includedDataTypes.IMAGES.length > 0) {
            const firstImage = productDetails.includedDataTypes.IMAGES[0];
            if (firstImage.large && firstImage.large.url) {
                imageUrl = firstImage.large.url;
            } else if (firstImage.medium && firstImage.medium.url) {
                imageUrl = firstImage.medium.url;
            } else if (firstImage.small && firstImage.small.url) {
                imageUrl = firstImage.small.url;
            }
        }

        // Return only the requested fields
        const response = {
            asin: productDetails.asin,
            features: productDetails.features || [],
            title: productDetails.title,
            description: productDetails.productDescription || '',
            price: price,
            image: imageUrl,
            url: productDetails.url,
            hasAddToCart: true,
            offerId: offerId,
            supplierId: 'AmazonBusiness'
        };

        console.log('Returning product details:', JSON.stringify(response, null, 2));
        res.json(response);

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

// Place order endpoint - Amazon Business Ordering API
router.post('/place-order', validateCredentials, async (req, res) => {
    try {
        console.log('Place order request received');
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

        // Get a fresh access token
        const accessToken = await ProductSearchService.getValidAccessToken();

        // Construct the place order request according to the Amazon Business Ordering API
        const externalId = `${asin}-IntegrationAgent-${Date.now()}`;
        
        const placeOrderRequest = {
            externalId: externalId,
            lineItems: [
                {
                    externalId: "line-item-1",
                    quantity: 1,
                    attributes: [
                        {
                            attributeType: "SelectedProductReference",
                            productReference: {
                                productReferenceType: "ProductIdentifier",
                                id: asin
                            }
                        },
                        {
                            buyingOptionReference: {
                                buyingOptionReferenceType: "BuyingOptionIdentifier",
                                id: offerId
                            },
                            attributeType: "SelectedBuyingOptionReference"
                        }
                    ],
                    expectations: [
                        {
                            expectationType: "ExpectedUnitPrice",
                            amount: {
                                currencyCode: "USD",
                                amount: 10000.00
                            }
                        },
                        {
                            expectationType: "ExpectedCharge",
                            amount: {
                                currencyCode: "USD",
                                amount: 1000.00
                            },
                            source: "SUBTOTAL"
                        },
                        {
                            expectationType: "ExpectedCharge",
                            amount: {
                                currencyCode: "USD",
                                amount: 100.50
                            },
                            source: "TAX"
                        },
                        {
                            expectationType: "ExpectedCharge",
                            amount: {
                                currencyCode: "USD",
                                amount: 500.00
                            },
                            source: "SHIPPING"
                        }
                    ]
                }
            ],
            attributes: [
                {
                    attributeType: "PurchaseOrderNumber",
                    purchaseOrderNumber: "ExamplePurchaseOrderNumber"
                },
                {
                    attributeType: "BuyerReference",
                    userReference: {
                        userReferenceType: "UserEmail",
                        emailAddress: "saibhavy+USProd@amazon.com"
                    }
                },
                {
                    attributeType: "BuyingGroupReference",
                    groupReference: {
                        groupReferenceType: "GroupIdentity",
                        identifier: "TestGroupforsaibhavy9980632074"
                    }
                },
                {
                    attributeType: "Region",
                    region: "US"
                },
                {
                    attributeType: "SelectedPaymentMethodReference",
                    paymentMethodReference: {
                        paymentMethodReferenceType: "StoredPaymentMethod"
                    }
                },
                {
                    attributeType: "ShippingAddress",
                    address: {
                        addressType: "PhysicalAddress",
                        fullName: "Example User",
                        phoneNumber: "1234567890",
                        companyName: "Example Company",
                        addressLine1: "123 Example St.",
                        addressLine2: "456",
                        city: "Seattle",
                        stateOrRegion: "WA",
                        postalCode: "98109",
                        countryCode: "US"
                    }
                }
            ],
            expectations: []
        };

        console.log('Place order request payload:', JSON.stringify(placeOrderRequest, null, 2));

        // Call the ProductSearchService to place the order
        const orderResult = await ProductSearchService.placeOrder(placeOrderRequest, req.amazonHeaders);

        console.log('Place order completed successfully');
        console.log('Place order response:', JSON.stringify(orderResult, null, 2));

        res.json(orderResult);

    } catch (error) {
        console.error('Error placing order:', error);
        
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

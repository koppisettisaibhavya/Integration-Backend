const axios = require('axios');

class ProductSearchService {
    constructor() {
        this.baseURL = process.env.AMAZON_BUSINESS_API_BASE_URL || 'https://na.business-api.amazon.com';
        this.apiVersion = process.env.API_VERSION || '2020-08-26';
        this.currentAccessToken = null;
        this.tokenExpiryTime = null;
    }

    /**
     * Refresh the Amazon access token using the refresh token
     * @returns {Promise<string>} - Returns the new access token
     */
    async refreshAccessToken() {
        try {
            console.log('Refreshing Amazon access token...');
            
            const tokenUrl = process.env.AMAZON_TOKEN_URL || 'https://api.amazon.com/auth/O2/token';
            const clientId = process.env.AMAZON_CLIENT_ID;
            const clientSecret = process.env.AMAZON_CLIENT_SECRET;
            const refreshToken = process.env.AMAZON_REFRESH_TOKEN;

            if (!clientId || !clientSecret || !refreshToken) {
                throw new Error('Missing required OAuth credentials in environment variables');
            }

            const response = await axios.post(tokenUrl, new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            });

            const { access_token, expires_in } = response.data;
            
            if (!access_token) {
                throw new Error('No access token received from refresh request');
            }

            // Store the new token and calculate expiry time
            this.currentAccessToken = access_token;
            this.tokenExpiryTime = Date.now() + (expires_in * 1000) - 60000; // Refresh 1 minute before expiry

            console.log('Access token refreshed successfully');
            console.log(`Token expires in ${expires_in} seconds`);

            return access_token;

        } catch (error) {
            console.error('Error refreshing access token:', error.response?.data || error.message);
            throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Get a valid access token, refreshing if necessary
     * @returns {Promise<string>} - Returns a valid access token
     */
    async getValidAccessToken() {
        // Check if we need to refresh the token
        if (!this.currentAccessToken || !this.tokenExpiryTime || Date.now() >= this.tokenExpiryTime) {
            console.log('Token expired or not available, refreshing...');
            return await this.refreshAccessToken();
        }

        console.log('Using existing valid token');
        return this.currentAccessToken;
    }

    /**
     * Validates the access token by making a simple API call
     * @param {Object} headers - Amazon headers containing accessToken and userEmail
     * @returns {Promise<boolean>} - Returns true if token is valid
     */
    async validateToken(headers) {
        try {
            console.log('Validating access token...');
            
            // Make a simple search request to validate the token
            const response = await axios.get(`${this.baseURL}/products/${this.apiVersion}/products`, {
                params: {
                    keywords: 'test',
                    productRegion: 'US',
                    locale: 'en_US',
                    pageSize: 1
                },
                headers: {
                    'x-amz-access-token': 'Atza|IwEBIM9ec7CoFGQaAxFgh8pOgee1eou8CR3L-tMmOFCblCwcKR9ZZHh9Lqj9CW7vpHelPski1p4BgAsu1iuSHQv7Ejo0Y9EFBuZnZSur3Cgw_jihg0ZaWR64nca-YMMjILBqb_od_m6idbFzjujE79xcqYtNkcssmWQDUCbqsGmL5FftN7yE0xyec43tjX65EcDkAIoR3_0KmiHYiqriUqSR6rRyTnWpSAByEvBz1-Lggqyx-9W2rdkyRqzW-4E00pTEwIcR9gE0T-K-6QVX8AB-2x4SYr2wn1bE8SPVcnspNcENHfbWmYDOBLtOf6Sv8qKeOGSwBXaOrxgJampg2rVLZg95oPnDNrdMl_GJeEsKIOyhoo4tkzjbI25vto4ysaGbL1g',
                    'x-amz-user-email': headers.userEmail,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('Token validation successful');
            return true;
        } catch (error) {
            console.error('Token validation failed:', error.response?.status, error.response?.data);
            throw error;
        }
    }

    /**
     * Search for products using the Amazon Business API
     * @param {Object} searchParams - Search parameters
     * @param {Object} headers - Amazon headers containing accessToken and userEmail
     * @returns {Promise<Object>} - Search results
     */
    async searchProducts(searchParams, headers) {
        try {
            console.log('Making API call to Amazon Business API...');
            console.log('Search parameters:', searchParams);

            // Get a fresh access token
            const accessToken = await this.getValidAccessToken();

            const {
                keywords,
                productRegion,
                locale,
                pageNumber,
                pageSize,
                facets
            } = searchParams;

            const apiUrl = `${this.baseURL}/products/${this.apiVersion}/products`;
            
            const params = {
                keywords,
                productRegion,
                locale,
                pageNumber,
                pageSize,
                facets: facets.join(',')
            };

            console.log('API URL:', apiUrl);
            console.log('Request params:', params);

            const response = await axios.get(apiUrl, {
                params,
                headers: {
                    'x-amz-access-token': accessToken,
                    'x-amz-user-email': headers.userEmail,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ProductSearchApp/1.0'
                },
                timeout: 30000 // 30 second timeout
            });

            console.log('API Response Status:', response.status);
            console.log('Request ID:', response.headers['x-amzn-requestid']);
            console.log('Rate Limit:', response.headers['x-amzn-ratelimit-limit']);

            return response.data;

        } catch (error) {
            console.error('Error in searchProducts:', error.message);
            
            if (error.response) {
                console.error('API Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });
                console.error('Request ID:', error.response.headers?.['x-amzn-requestid']);
            } else if (error.request) {
                console.error('Network Error - No response received:', error.request);
            } else {
                console.error('Request Setup Error:', error.message);
            }

            throw error;
        }
    }

    /**
     * Get product details by ASIN
     * @param {Object} productParams - Product parameters
     * @param {Object} headers - Amazon headers containing accessToken and userEmail
     * @returns {Promise<Object>} - Product details
     */
    async getProductDetails(productParams, headers) {
        try {
            console.log('Getting product details for ASIN:', productParams.asin);

            // Get a fresh access token
            const accessToken = await this.getValidAccessToken();

            const {
                asin,
                productRegion,
                locale,
                facets
            } = productParams;

            const apiUrl = `${this.baseURL}/products/${this.apiVersion}/products/${asin}`;
            
            const params = {
                productRegion,
                locale,
                facets: facets.join(',')
            };

            console.log('API URL:', apiUrl);
            console.log('Request params:', params);

            const response = await axios.get(apiUrl, {
                params,
                headers: {
                    'x-amz-access-token': accessToken,
                    'x-amz-user-email': headers.userEmail,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ProductSearchApp/1.0'
                },
                timeout: 30000
            });

            console.log('Product details API Response Status:', response.status);
            console.log('Request ID:', response.headers['x-amzn-requestid']);

            return response.data;

        } catch (error) {
            console.error('Error in getProductDetails:', error.message);
            
            if (error.response) {
                console.error('API Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
                console.error('Request ID:', error.response.headers?.['x-amzn-requestid']);
            }

            throw error;
        }
    }

    /**
     * Get offers for a specific product
     * @param {Object} offerParams - Offer parameters
     * @param {Object} headers - Amazon headers containing accessToken and userEmail
     * @returns {Promise<Object>} - Product offers
     */
    async getProductOffers(offerParams, headers) {
        try {
            console.log('Getting offers for ASIN:', offerParams.asin);

            // Get a fresh access token
            const accessToken = await this.getValidAccessToken();

            const {
                asin,
                productRegion,
                locale,
                pageNumber = 0,
                pageSize = 24
            } = offerParams;

            const apiUrl = `${this.baseURL}/products/${this.apiVersion}/products/${asin}/offers`;
            
            const params = {
                productRegion,
                locale,
                pageNumber,
                pageSize
            };

            console.log('Offers API URL:', apiUrl);
            console.log('Request params:', params);

            const response = await axios.get(apiUrl, {
                params,
                headers: {
                    'x-amz-access-token': accessToken,
                    'x-amz-user-email': headers.userEmail,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ProductSearchApp/1.0'
                },
                timeout: 30000
            });

            console.log('Offers API Response Status:', response.status);
            console.log('Request ID:', response.headers['x-amzn-requestid']);

            return response.data;

        } catch (error) {
            console.error('Error in getProductOffers:', error.message);
            
            if (error.response) {
                console.error('API Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
                console.error('Request ID:', error.response.headers?.['x-amzn-requestid']);
            }

            throw error;
        }
    }
}

module.exports = new ProductSearchService();

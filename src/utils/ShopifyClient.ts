import { ValidConfig } from '../types';
type PriceType = {
  amount: string;
  currencyCode: string;
};

type ImageNode = {
  altText?: string;
  id: string;
  originalSrc: string;
};

type CollectionNode = {
  description?: string;
  descriptionHtml?: string;
  handle: string;
  id: string;
  title: string;
  updatedAt: string;
};

type VariantNode = {
  availableForSale: boolean;
  compareAtPriceV2?: PriceType;
  id: string;
  image?: ImageNode;
  priceV2: PriceType;
  requiresShipping: boolean;
  selectedOptions?: {
    name: string;
    value: string;
  }[];
  sku?: string;
  title: string;
  weight?: number;
  weightUnit?: string;
};

type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  availableForSale: boolean;
  collections: {
    edges: { node: CollectionNode }[];
  };
  createdAt: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  id: string;
  images: {
    edges: { node: ImageNode }[];
  };
  onlineStoreUrl?: string;
  options: ProductOption[];
  productType: string;
  publishedAt: string;
  tags: string[];
  title: string;
  updatedAt: string;
  variants: {
    edges: { node: VariantNode }[];
  };
  vendor: string;
};

export type Products = {
  edges: [{ node: Product }];
};

const productFragment = `
  options(first: 50) {
    id
    name
    values
  } 
  id
  handle
  collections(first: 250) {
    edges {
      node {
        description
        descriptionHtml
        handle
        id
        updatedAt
        title
      }
    }
  }
  title
  availableForSale
  createdAt
  description
  descriptionHtml
  images(first: 250) {
      edges {
        node {
          altText
          id
          originalSrc
        }
      }
    }
  variants(first: 250) {
    edges {
      node {
        priceV2 {
          amount
          currencyCode
        }
        title
        image {
          altText
          originalSrc
          id
        }
        compareAtPriceV2 {
          amount
          currencyCode
        }
        weightUnit
        weight
        availableForSale
        sku
        requiresShipping
         selectedOptions {
          name
          value
         }
        id
        quantityAvailable
      }
    }
  }
  onlineStoreUrl
  productType
  publishedAt
  tags
  updatedAt
  vendor
`;

const normalizeProduct = (product: any): Product => {
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product');
  }

  return {
    ...product,
    imageUrl: product.images.edges[0]?.node.src || '',
  };
};

const normalizeProducts = (products: any): Product[] =>
  products.edges.map((edge: any) => normalizeProduct(edge.node));

export default class ShopifyClient {
  storefrontAccessToken: string;
  shopifyDomain: string;

  constructor({
    storefrontAccessToken,
    shopifyDomain,
  }: Pick<ValidConfig, 'shopifyDomain' | 'storefrontAccessToken'>) {
    this.storefrontAccessToken = storefrontAccessToken;
    this.shopifyDomain = shopifyDomain;
  }

  async productsMatching(query: string) {
    const response = await this.fetch({
      query: `
        query getProducts($query: String) {
            products(first: 10, query: $query) {
              edges {
                node {
                  ${productFragment}
                }
              }
          }
        }
      `,
      variables: { query: query || null },
    });
    return normalizeProducts(response.products);
  }

  async productByHandle(handle: string) {
    const response = await this.fetch({
      query: `
        query getProduct($handle: String!) {
          product: productByHandle(handle: $handle) {
            ${productFragment}
          }
        }
      `,
      variables: { handle },
    });

    return normalizeProduct(response.product);
  }

  async fetch(requestBody: any) {
    const res = await fetch(
      `https://${this.shopifyDomain}.myshopify.com/api/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (res.status !== 200) {
      throw new Error(`Invalid status code: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const body = await res.json();

    return body.data;
  }
}

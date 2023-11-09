import {useCallback, useEffect, useMemo} from 'react';
import {normalizeConfig} from '../../types';
import Price from '../Price';
import {useCtx} from 'datocms-react-ui';
import {RenderFieldExtensionCtx} from 'datocms-plugin-sdk';
import ShopifyClient from '../../utils/ShopifyClient';
import useStore, {State} from '../../utils/useStore';
import s from './styles.module.css';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faExternalLinkAlt,
    faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

export type ValueProps = {
    value: string;
    onReset: () => void;
};

export default function Value({value, onReset}: ValueProps) {
    console.log(value);
    const ctx = useCtx<RenderFieldExtensionCtx>();

    const {storefrontAccessToken, shopifyDomain} = normalizeConfig(
        ctx.plugin.attributes.parameters,
    );

    const client = useMemo(
        () => new ShopifyClient({shopifyDomain, storefrontAccessToken}),
        [storefrontAccessToken, shopifyDomain],
    );

    const {product, status} = useStore(
        useCallback((state) => (state as State).getProduct(value), [value]),
    );

    const options = useStore((state) => (state as State).getOptions());
    console.log("loadedOptions", options);

    const fetchProductByHandle = useStore(
        (state) => (state as State).fetchProductByHandle,
    );

    useEffect(() => {
        fetchProductByHandle(client, value);
    }, [client, value, fetchProductByHandle]);

    return (
        <div
            className={classNames(s['value'], {
                [s['loading']]: status === 'loading',
            })}
        >
            {status === 'error' && (
                <div className={s['product']}>
                    API Error! Could not fetch details for product:&nbsp;
                    <code>{value}</code>
                </div>
            )}
            {product && (
                <div className={s['product']}>
                    <div
                        className={s['product__image']}
                        style={{backgroundImage: `url(${product.images.edges[0].node.originalSrc})`}}
                    />
                    <div className={s['product__info']}>
                        <div className={s['product__title']}>
                            <a
                                href={product.onlineStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {product.title}
                            </a>
                            <FontAwesomeIcon icon={faExternalLinkAlt}/>
                        </div>
                        <div className={s['product__selectedoptions']}>
                            <ul>
                                {
                                    Object.entries(options).map(([key, value]) => (
                                        <li key={key}>
                                            <strong>{key}</strong>: {value}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                        <div className={s['product__description']}>
                            {product.description}
                        </div>
                        {product.productType && (
                            <div className={s['product__producttype']}>
                                <strong>Product type:</strong>
                                &nbsp;
                                {product.productType}
                            </div>
                        )}

                        {product.variants.edges.length > 0 && (
                            <div className={s['product__price']}>
                                <strong>Price:</strong>
                                &nbsp;
                                <Price {...product.variants.edges[0].node.priceV2} />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <button type="button" onClick={onReset} className={s['reset']}>
                <FontAwesomeIcon icon={faTimesCircle}/>
            </button>
        </div>
    );
}

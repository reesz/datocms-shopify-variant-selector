import {RenderModalCtx} from 'datocms-plugin-sdk';
import {FormEvent, useEffect, useMemo, useState} from 'react';
import {Button, TextInput, Canvas, Spinner} from 'datocms-react-ui';
import s from './styles.module.css';
import ShopifyClient, {Product} from '../../utils/ShopifyClient';
import useStore, {State} from '../../utils/useStore';
import {normalizeConfig} from '../../types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

export default function BrowseProductsModal({ctx}: { ctx: RenderModalCtx }) {
    const performSearch = useStore(
        (state) => (state as State).fetchProductsMatching,
    );

    const submitOptions = useStore(
        (state) => (state as State).setOptions,
    );

    const {query, status, products} = useStore((state) =>
        (state as State).getCurrentSearch(),
    );

    const [sku, setSku] = useState<string>('');

    const [product, setProduct] = useState<Product | null>(null);

    const [options, setOptions] = useState<{}>({});

    const {storefrontAccessToken, shopifyDomain} = normalizeConfig(
        ctx.plugin.attributes.parameters,
    );

    const client = useMemo(() => {
        return new ShopifyClient({shopifyDomain, storefrontAccessToken});
    }, [storefrontAccessToken, shopifyDomain]);

    useEffect(() => {
        performSearch(client, query);
    }, [performSearch, query, client]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        performSearch(client, sku);
    };

    return (
        <Canvas ctx={ctx}>
            <div className={s['browse']}>
                <form className={s['search']} onSubmit={handleSubmit}>
                    <TextInput
                        placeholder="Search products... (ie. mens shirts)"
                        id="sku"
                        name="sku"
                        value={sku}
                        onChange={setSku}
                        className={s['search__input']}
                    />

                    <Button
                        type="submit"
                        buttonType="primary"
                        buttonSize="s"
                        leftIcon={<FontAwesomeIcon icon={faSearch}/>}
                        disabled={status === 'loading'}
                    >
                        Search
                    </Button>
                </form>
                <div className={s['container']}>
                    {products?.filter((x: any) => !!x) && (
                        <div
                            className={classNames(s['products'], {
                                [s['products__loading']]: status === 'loading',
                            })}
                        >
                            {products.map((product: Product) => (
                                <button
                                    key={product.handle}
                                    onClick={() => setProduct(product)}
                                    className={s['product']}
                                >
                                    <div
                                        className={s['product__image']}
                                        style={{backgroundImage: `url(${product.images.edges[0].node.originalSrc})`}}
                                    />
                                    <div className={s['product__content']}>
                                        <div className={s['product__title']}>{product.title}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {product && (
                        <div>
                            <h2>Choose variation options:</h2>
                            <div className={s['variation__options']}>
                                {product.options.map((option) => (
                                    <div key={option.name}>
                                        <h3>{option.name}</h3>
                                        <select name={option.name} id={option.name}
                                        onChange={
                                            (e) => {
                                                setOptions({...options, [option.name]: e.target.value});
                                            }
                                        }
                                        >
                                            {option.values.map((value) => (
                                                <option key={value}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            submitOptions(options);
                            return ctx.resolve({product, options});
                        }}
                        className={s['submit']}
                    >
                        Select variant
                    </button>

                    {status === 'loading' && <Spinner size={25} placement="centered"/>}
                    {status === 'success' && products && products.length === 0 && (
                        <div className={s['empty']}>No products found!</div>
                    )}
                    {status === 'error' && (
                        <div className={s['empty']}>API call failed!</div>
                    )}
                </div>
            </div>
        </Canvas>
    );
}

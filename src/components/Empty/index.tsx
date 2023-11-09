import { Button, useCtx } from 'datocms-react-ui';
import s from './styles.module.css';
import { Product } from '../../utils/ShopifyClient';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import {PluginResolveType} from "../../entrypoints/FieldExtension";

export type EmptyProps = {
  onSelect: (res: PluginResolveType) => void;
};

export default function Empty({ onSelect }: EmptyProps) {
  const ctx = useCtx<RenderFieldExtensionCtx>();

  const handleOpenModal = async () => {
    const res = (await ctx.openModal({
      id: 'browseProducts',
      title: 'Browse Shopify products',
      width: 'xl',
    })) as PluginResolveType | null;

    if (res) {
      onSelect(res);
    }
  };

  return (
    <div className={s['empty']}>
      <div className={s['empty__label']}>No product selected!</div>
      <Button
        onClick={handleOpenModal}
        buttonSize="s"
        leftIcon={<FontAwesomeIcon icon={faSearch} />}
      >
        Browse Shopify products
      </Button>
    </div>
  );
}

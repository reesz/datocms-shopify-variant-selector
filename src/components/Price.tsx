import { PriceType } from "../utils/ShopifyClient";

export default function Price({ amount, currencyCode }: PriceType) {
  return (
    <span>
      {currencyCode}
      &nbsp;
      {amount}
    </span>
  );
}

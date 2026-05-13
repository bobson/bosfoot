// Reusable objects
import { localeString } from './objects/localeString'
import { localeText } from './objects/localeText'
import { localeSlug } from './objects/localeSlug'
import { productSpecs } from './objects/productSpecs'
import { variant } from './objects/variant'
import { sizeChart, sizeChartRow } from './objects/sizeChart'

// Documents
import { product } from './documents/product'
import { brand } from './documents/brand'
import { category } from './documents/category'
import { order } from './documents/order'
import { shippingZone } from './documents/shippingZone'
import { siteSettings } from './documents/siteSettings'
import { article } from './documents/article'

export const schemaTypes = [
  // Objects (reusable)
  localeString,
  localeText,
  localeSlug,
  productSpecs,
  variant,
  sizeChartRow,
  sizeChart,
  // Documents
  product,
  brand,
  category,
  order,
  shippingZone,
  siteSettings,
  article,
]